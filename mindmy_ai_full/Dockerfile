FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml poetry.lock* /app/
RUN pip install poetry==1.8.2 && poetry config virtualenvs.create false && poetry install --no-root --only main
COPY . /app
CMD ["uvicorn", "mindmy_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
