import { useEffect, useRef, useState } from 'react';
import {useDropzone} from "react-dropzone";
import './FilesBar.css';

export type DroppedPdf = {
  name: string;
  path: string;
  file: File;
};

type FilesBarProps = {
  title: string;
  files: DroppedPdf[];
  onFilesAdded: (files: DroppedPdf[]) => void;
  onSelect: (file: DroppedPdf) => void;
  onRemove: (file: DroppedPdf, index: number) => void;
  onError: (message: string) => void;
};

function FilesBar({
  title,
  files,
  onFilesAdded,
  onSelect,
  onRemove,
  onError,
}: FilesBarProps) {
  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    onDrop: acceptedFiles => {
      const added: DroppedPdf[] = [];

      for (const file of acceptedFiles) {
        const path = (file as File & { path?: string }).path;
        if (!path) {
          onError(`Couldn't get the full path for ${file.name}.`);
          continue;
        }

        added.push({ name: file.name, path, file });
      }

      onFilesAdded(added);
    },
  });

  return (
    <div id="files-bar" className="toplevel">
      <div id="title-bar">
        <div id="title-bar-text">
          <span>{title}</span>
        </div>
      </div>

      <div id="files-bar-content" {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <ul>
          {files.map((file: DroppedPdf, index: number) => (
            <li key={`${file.path}-${index}`}>
              <button
                className="file-name"
                type="button"
                onClick={() => onSelect(file)}
              >
                {file.name}
              </button>
              <button
                className="file-remove"
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemove(file, index)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FilesBar;