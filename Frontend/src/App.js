import React, { useEffect, useState } from "react";
import axios from "axios";
import * as pdfjs from "pdfjs-dist";

// Set the PDF worker source
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPdfData(null); // Reset PDF data when a new file is selected
    setImageSrc(null); // Reset image data when a new file is selected
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:5000/upload", formData);
      alert("File uploaded successfully");
      showFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
    setLoading(false);
  };

  const renderPdf = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const data = new Uint8Array(reader.result);
        const pdf = await pdfjs.getDocument({ data }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.getElementById("pdfCanvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext);
        setPdfData(canvas.toDataURL("image/jpeg"));
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  };

  const showFiles = async () => {
    axios.get('http://localhost:5000/files')
      .then(response => {
        setFiles(response.data);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });
  }
  useEffect(() => {
    showFiles();
  }, []);

  const renderImage = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error rendering image:", error);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-center mt-5 text-light">EditMasters</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        {pdfData && file.type === "application/pdf" && (
          <img src={pdfData} alt="PDF Preview" />
        )}
        {imageSrc && file.type.startsWith("image/") && (
          <img src={imageSrc} alt="Image Preview" />
        )}
        <canvas id="pdfCanvas" style={{ display: "none" }}></canvas>
      </div>
      <div>
        <h2>Files</h2>
        <ul style={{ listStyleType: 'none', display: 'flex' }}>
          {files.map((file) => (
            <li key={file._id} style={{ marginLeft: '10px' }}>
              <a href={`http://localhost:5000/${file.path}`} download style={{ color: 'white' }}>
                <img width={350} height={350} src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1200px-PDF_file_icon.svg.png" alt="Description of the image" />
                <br></br>
                {file.name}
              </a>
            </li>
          ))}
        </ul>

      </div>
    </>

  );
};

export default App;
