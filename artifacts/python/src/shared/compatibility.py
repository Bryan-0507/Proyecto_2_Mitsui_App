"""Import aliases needed by historical joblib artifacts, without copied code.

The existing files reference old module names. Only our known project modules
are redirected; this does not make untrusted pickle files safe to load.
"""
import importlib
import importlib.abc
import importlib.util
import sys

ALIASES = {
    "12_comprobacion_actividad": "src.experiments.market_activity.01_search",
    "modelado_utils": "src.shared.modeling",
    "modelado_ronda2_utils": "src.experiments.feature_engineering.core",
    "modelado_ronda3_utils": "src.experiments.adaptive_features.core",
    "modelado_actividad_utils": "src.experiments.market_activity.core",
    "modelado_cociente_utils": "src.experiments.price_ratio.core",
    "modelado_mlp_utils": "src.models.mlp.core",
    "modelado_compartido_utils": "src.models.lightgbm.shared_targets",
}


class LegacyLoader(importlib.abc.Loader):
    def __init__(self, target):
        self.target = target

    def create_module(self, spec):
        return importlib.import_module(self.target)

    def exec_module(self, module):
        pass


class LegacyFinder(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):
        if fullname in ALIASES:
            return importlib.util.spec_from_loader(fullname, LegacyLoader(ALIASES[fullname]))
        return None


def install_legacy_imports():
    if not any(isinstance(finder, LegacyFinder) for finder in sys.meta_path):
        sys.meta_path.insert(0, LegacyFinder())
