"""Native independent-target LightGBM configuration."""
from lightgbm import LGBMRegressor
from src.config import SEMILLA


def build_estimator(parameters):
    return LGBMRegressor(**parameters, objective="regression", random_state=SEMILLA,
                         n_jobs=2, verbosity=-1, deterministic=True,
                         force_col_wise=True)
