"""The original, unregularized ordinary least squares baseline."""
from sklearn.linear_model import LinearRegression


def build_estimator():
    return LinearRegression()
