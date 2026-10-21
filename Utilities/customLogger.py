import logging
from pathlib import Path


class LogGen:
    @staticmethod
    def loggen():
        logger = logging.getLogger("crm")
        log_dir = Path(__file__).resolve().parent.parent / "Logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / "automation.log"
        already_attached = any(
            isinstance(handler, logging.FileHandler)
            and Path(handler.baseFilename) == log_path
            for handler in logger.handlers
        )
        if not already_attached:
            handler = logging.FileHandler(filename=log_path, mode="a")
            handler.setFormatter(
                logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
            )
            logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        return logger