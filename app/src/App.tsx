import { useState, useEffect } from 'react'
import './App.css'
import FilesBar from './FilesBar';
import Content from './Content';

function App() {
  const [title, setTitle] = useState('New Workspace');
  const [selectedFile, setSelectedFile] = useState<string>("");

  useEffect(() => {
    document.title = title;
  }, []);

  return (
    <>
      <div id="app">
        <FilesBar title={title} setFile={setSelectedFile} />
        <Content selectedFile={selectedFile} />
      </div>
    </>
  )
}

export default App
