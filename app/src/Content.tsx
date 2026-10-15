import PDFPanel from './PDFPanel';
import './Content.css';

function Content({selectedFile}: {selectedFile: string}){
    return (<>
        <div id="content">
            <PDFPanel file={selectedFile} />
        </div>
    </>);
}

export default Content;