import typer
from pathlib import Path
from alembic import command, config

app = typer.Typer()

@app.command()
def migrate(direction: str):
    cfg = config.Config(str(Path(__file__).parent.parent / "migrations" / "alembic.ini"))
    if direction == "up":
        command.upgrade(cfg, "head")
    elif direction.startswith("down"):
        rev = direction.split()[1] if " " in direction else "-1"
        command.downgrade(cfg, rev)
    else:
        typer.echo("Usage: migrate up | migrate down <rev>")

@app.command()
def rollback(rev: str):
    cfg = config.Config(str(Path(__file__).parent.parent / "migrations" / "alembic.ini"))
    command.downgrade(cfg, rev)

def _run():
    app()

if __name__ == "__main__":
    _run()
