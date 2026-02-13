
data "external_schema" "sqlalchemy" {
  program = [
    ".\\venv\\Scripts\\python.exe",
    "atlas_schema.py"
  ]
}

env "local" {
  src = data.external_schema.sqlalchemy.url
  url = "postgres://postgres:0000@localhost:5500/smart_security?search_path=public&sslmode=disable"
  dev = "docker://postgres/16/dev?search_path=public"
}
