"""Local JSON Lines worker. Model adapters are loaded lazily and cached."""

import importlib
import json
import math
import sys
from numbers import Real
from pathlib import Path

sys.dont_write_bytecode = True


MAX_LINE_BYTES = 65_536
MAX_SAFE_INTEGER = 9_007_199_254_740_991
ADAPTER_MODULES = {
    "linear": "inference.linear",
    "temporal": "inference.temporal",
    "lightgbm": "inference.lightgbm",
    "external_lstm": "inference.external_lstm",
}
TARGET_IDS = {"target_225", "target_19", "target_105", "target_410"}


def diagnostic(message):
    print(message, file=sys.stderr, flush=True)


def emit(message):
    print(json.dumps(message, allow_nan=False), flush=True)


def emit_error(request_id, code):
    emit({"id": request_id, "type": "error", "code": code})


def reject_constant(value):
    raise ValueError(f"Non-standard JSON constant: {value}")


def load_metadata():
    project_root = Path(__file__).resolve().parent.parent
    path = project_root / "artifacts" / "contracts" / "benchmark.json"
    with path.open(encoding="utf-8") as source:
        contract = json.load(source, parse_constant=reject_constant)
    targets = contract["targets"]
    for target in TARGET_IDS:
        lag = targets[target]["lag"]
        if type(lag) is not int or not 1 <= lag <= MAX_SAFE_INTEGER:
            raise ValueError("Invalid target horizon in metadata.")
    return targets


def valid_payload(payload):
    if not isinstance(payload, dict):
        return False
    family = payload.get("family")
    target = payload.get("target")
    date_id = payload.get("dateId")
    return (
        isinstance(family, str)
        and family in ADAPTER_MODULES
        and isinstance(target, str)
        and target in TARGET_IDS
        and type(date_id) is int
        and 0 <= date_id <= MAX_SAFE_INTEGER
    )


def handle_command(command, metadata, adapters):
    if not isinstance(command, dict):
        diagnostic("Command is not a JSON object; cannot correlate a response.")
        return False
    request_id = command.get("id")
    if not isinstance(request_id, str) or not request_id.strip():
        diagnostic("Command has no valid ID; cannot correlate a response.")
        return False

    payload = command.get("payload")
    if command.get("type") != "predict" or not valid_payload(payload):
        emit_error(request_id, "invalid_request")
        return True

    request = {key: payload[key] for key in ("family", "target", "dateId")}
    family = request["family"]
    try:
        if family not in adapters:
            # Module names are fixed, never taken directly from user input.
            module = importlib.import_module(ADAPTER_MODULES[family])
            if not callable(getattr(module, "predict", None)):
                raise ImportError("Adapter has no predict function.")
            adapters[family] = module
    except (ImportError, OSError) as error:
        diagnostic(f"Adapter unavailable ({family}): {type(error).__name__}")
        emit_error(request_id, "model_unavailable")
        return True
    except Exception as error:
        diagnostic(f"Adapter initialization failed: {type(error).__name__}")
        emit_error(request_id, "inference_failed")
        return True

    try:
        # Each adapter must implement predict(request) -> finite number or None.
        # None means insufficient causal data, not a prediction of zero.
        value = adapters[family].predict(request)
        if value is None:
            emit_error(request_id, "unavailable_data")
            return True
        if isinstance(value, bool) or not isinstance(value, Real):
            raise ValueError("Adapter did not return a numeric prediction.")
        value = float(value)
        if not math.isfinite(value):
            raise ValueError("Prediction is not finite.")
        sign = "positive" if value > 0 else "negative" if value < 0 else "zero"
        result = {
            **request,
            "lag": metadata[request["target"]]["lag"],
            "value": value,
            "sign": sign,
        }
        emit({"id": request_id, "type": "result", "payload": result})
    except FileNotFoundError:
        emit_error(request_id, "model_unavailable")
    except Exception as error:
        diagnostic(f"Prediction failed: {type(error).__name__}")
        emit_error(request_id, "inference_failed")
    return True


def main():
    try:
        metadata = load_metadata()
    except Exception as error:
        diagnostic(f"Metadata initialization failed: {type(error).__name__}")
        return 1

    adapters = {}
    emit({"type": "ready"})
    while True:
        line = sys.stdin.buffer.readline(MAX_LINE_BYTES + 1)
        if not line:
            return 0
        if len(line) > MAX_LINE_BYTES or not line.endswith(b"\n"):
            diagnostic("Oversized or incomplete protocol line.")
            return 1
        try:
            command = json.loads(line.decode("utf-8"), parse_constant=reject_constant)
        except (UnicodeDecodeError, ValueError):
            diagnostic("Invalid JSON line; cannot correlate a response.")
            return 1
        if not handle_command(command, metadata, adapters):
            return 1


sys.exit(main())
