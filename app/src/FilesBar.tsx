import { useEffect, useRef, useState } from 'react';
import {useDropzone} from "react-dropzone";
import './FilesBar.css';

function FilesBar({title, setFile}: {title: string, setFile: (file: string) => void}) {
    const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
    const fileUrls = useRef<string[]>([]);

    useEffect(() => () => {
        fileUrls.current.forEach(URL.revokeObjectURL);
    }, []);

    const {getRootProps, getInputProps} = useDropzone({
        noClick: true,
        onDrop: acceptedFiles => {
            const droppedFiles = acceptedFiles.map(file => {
                const url = URL.createObjectURL(file);
                fileUrls.current.push(url);
                return {name: file.name, url};
            });
            setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
        }
    });

    return (
    <>
        <div id="files-bar" className="toplevel">
            <div id="title-bar">
                <div id="title-bar-text">
                    <span>{title}</span>
                </div>
            </div>
            <div id="files-bar-content" {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <ul>
                    {files.map(file => (
                        <li key={file.url}>
                            <button
                                type="button"
                                onClick={event => {
                                    event.stopPropagation();
                                    setFile(file.url);
                                }}
                            >
                                {file.name}
                            </button>
                            <button className="x" onClick={event => {
                                event.stopPropagation();
                                const newFiles = files.filter(f => f.url !== file.url);
                                setFiles(newFiles);
                                setFile(newFiles.length > 0 ? newFiles[0].url : '');
                            }}>
                                X
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </>
  )
}

export default FilesBar