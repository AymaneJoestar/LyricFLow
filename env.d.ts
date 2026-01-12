declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    SUNO_API_KEY?: string;
    SUNO_API_URL?: string;
    MONGO_URI?: string;
  }
}
