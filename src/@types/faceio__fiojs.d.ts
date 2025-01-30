declare module '@faceio/fiojs' {
    export default class faceIO {
      constructor(apiKey: string);
  
      enroll(options: {
        locale: string;
        payload?: Record<string, any>;
      }): Promise<{
        facialId: string;
        timestamp: string;
        payload: Record<string, any>;
      }>;
  
      authenticate(options: {
        locale: string;
      }): Promise<{
        facialId: string;
        timestamp: string;
        details: Record<string, any>;
      }>;
    }
  }