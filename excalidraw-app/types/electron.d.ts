export {};

declare global {
  interface Window {
    sketchora?: {
      openFile: () => Promise<{
        filePath: string;
        content: string;
      } | null>;

      saveFile: (payload: {
        filePath: string | null;
        content: string;
      }) => Promise<{
        filePath: string;
        saved: boolean;
      } | null>;

      saveFileAs: (payload: { content: string }) => Promise<{
        filePath: string;
        saved: boolean;
      } | null>;

      getCurrentFilePath: () => Promise<string | null>;

      onMenuNew: (callback: () => void) => () => void;

      onMenuOpenResult: (
        callback: (data: { filePath: string; content: string }) => void,
      ) => () => void;

      onMenuSave: (callback: () => void) => () => void;

      onMenuSaveAs: (callback: () => void) => () => void;
    };
  }
}
