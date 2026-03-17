# Worker App

This is a background worker that processes report generation jobs from an SQS queue.

## Setup

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Fill in the environment variables:
    - AWS Credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
    - SQS Queue URL (`SQS_QUEUE_URL`)
    - API Keys (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`)
    - Database URL (`DATABASE_URL`)

## Running Locally

To run the worker in development mode:

```bash
pnpm dev
```

To build and run:

```bash
pnpm build
pnpm start
```

## Architecture

The worker polls the SQS queue for messages containing report generation tasks.
For each message, it:

1.  Downloads audio from S3.
2.  Transcribes the audio using ElevenLabs.
3.  Labels speakers using OpenAI.
4.  Evaluates the transcript using OpenAI.
5.  Calculates scores.
6.  Updates the database with results.

If processing is successful, the message is deleted from the queue.
If processing fails, the message remains in the queue (after visibility timeout) for retry.
