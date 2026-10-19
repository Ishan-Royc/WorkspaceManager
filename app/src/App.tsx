import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import FilesBar, { type DroppedPdf } from './FilesBar';
import Content from './Content';

function App() {
  const [title] = useState('New Workspace');
  const [files, setFiles] = useState<DroppedPdf[]>([]);
  const [selectedFile, setSelectedFile] = useState<DroppedPdf | null>(null);
  const [openRequest, setOpenRequest] = useState(0);
  const [closeRequests, setCloseRequests] = useState<
    { id: number; file: DroppedPdf }[]
  >([]);
  const [status, setStatus] = useState('');
  const nextCloseRequestId = useRef(0);

  const selectFile = (file: DroppedPdf) => {
    setSelectedFile(file);
    setOpenRequest(request => request + 1);
  };

  const removeFile = (file: DroppedPdf, index: number) => {
    const requestId = nextCloseRequestId.current++;
    setCloseRequests(current => [...current, { id: requestId, file }]);

    const remainingFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(remainingFiles);

    if (selectedFile === file) {
      const nextFile =
        remainingFiles[Math.min(index, remainingFiles.length - 1)] ?? null;
      setSelectedFile(nextFile);
      if (nextFile) {
        setOpenRequest(request => request + 1);
      }
    }
  };

  const saveWorkspace = useCallback(async () => {
    try {
      const result = await window.workspaceApi.saveWorkspace({
        version: 1,
        title,
        files: files.map(({ name, path }) => ({ name, path })),
        selectedFilePath: selectedFile?.path ?? null,
      });

      if (!result.canceled) {
        setStatus(`Saved to ${result.filePath}`);
      }
    } catch (cause) {
      setStatus(
        `Save failed: ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    }
  }, [files, selectedFile, title]);

  useEffect(
    () => window.workspaceApi.onSaveRequested(() => void saveWorkspace()),
    [saveWorkspace],
  );

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div id="app">
      <FilesBar
        title={title}
        files={files}
        onFilesAdded={added => setFiles(current => [...current, ...added])}
        onSelect={selectFile}
        onRemove={removeFile}
        onError={setStatus}
      />
      <Content
        selectedFile={selectedFile}
        requestId={openRequest}
        closeRequests={closeRequests}
        onCloseRequestComplete={id =>
          setCloseRequests(current => current.filter(request => request.id !== id))
        }
      />
      <span role="status">{status}</span>
    </div>
  );
}

export default App;