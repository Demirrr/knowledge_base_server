# Docker Usage

## Building the Docker Image

Build the image:

```bash
docker build -t knowledge-base-server .
```

## Running with Docker

### Basic Usage (ephemeral storage)

```bash
docker run -i --rm knowledge-base-server
```

### With Persistent Storage

Create a volume:

```bash
docker volume create kb-data
```

Run with the volume:

```bash
docker run -i --rm -v kb-data:/app/data knowledge-base-server
```

### With Custom Storage Location

Mount a local directory:

```bash
docker run -i --rm -v /path/to/local/storage:/app/data knowledge-base-server
```

## Using with Claude Desktop

Add this configuration to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "kb-data:/app/data",
        "knowledge-base-server"
      ]
    }
  }
}
```

## Using with VS Code

Add this to `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "knowledge-base": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-v",
          "kb-data:/app/data",
          "knowledge-base-server"
        ]
      }
    }
  }
}
```

## Managing Docker Volumes

List volumes:
```bash
docker volume ls
```

Inspect a volume:
```bash
docker volume inspect kb-data
```

Remove a volume:
```bash
docker volume rm kb-data
```

Backup data from volume:
```bash
docker run --rm -v kb-data:/data -v $(pwd):/backup alpine tar czf /backup/kb-backup.tar.gz -C /data .
```

Restore data to volume:
```bash
docker run --rm -v kb-data:/data -v $(pwd):/backup alpine tar xzf /backup/kb-backup.tar.gz -C /data
```

## Multi-platform Build

Build for multiple architectures:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t knowledge-base-server .
```

## Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  knowledge-base:
    build: .
    image: knowledge-base-server
    stdin_open: true
    volumes:
      - kb-data:/app/data
    environment:
      - NODE_ENV=production

volumes:
  kb-data:
```

Run with Docker Compose:

```bash
docker-compose up
```
