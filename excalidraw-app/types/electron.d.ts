export {};

declare global {
  interface Window {
    sketchora?: {
      openFile: () => Promise<{ filePath: string; content: string } | null>;
      saveFile: (payload: {
        filePath: string | null;
        content: string;
      }) => Promise<{ filePath: string; saved: boolean } | null>;
      saveFileAs: (payload: { content: string }) => Promise<{
        filePath: string;
        saved: boolean;
      } | null>;
      getCurrentFilePath: () => Promise<string | null>;
      setWindowTitle: (filePath: string | null, dirty: boolean) => void;
      onMenuNew: (callback: () => void) => () => void;
      onMenuOpen: (callback: () => void) => () => void;
      onMenuSave: (callback: () => void) => () => void;
      onMenuSaveAs: (callback: () => void) => () => void;
      onOpenResult: (
        callback: (data: { filePath: string; content: string }) => void,
      ) => () => void;
    };
  }
}
