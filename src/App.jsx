import { useRef, useEffect, useState } from "react";

import * as pdfjsLib from "pdfjs-dist";

import samplePDF from "./assets/sample.pdf";
import "./App.css";

function App() {
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(0.8);

  function renderPage(num, canvas, ctx) {
    setPageRendering(true);
    // Using promise to fetch the page
    pdfDoc?.getPage(num).then(function (page) {
      var viewport = page.getViewport({ scale: scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        setPageRendering(false);
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          setPageNumPending(null);
        }
      });
    });

    // Update page counters
    setPageNum(num);
  }

  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    setPageNum((prev) => prev - 1);
  }

  function onNextPage() {
    if (pageNum >= pdfDoc?.numPages) {
      return;
    }
    setPageNum((prev) => prev + 1);
  }

  const canvasRef = useRef(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "../node_modules/pdfjs-dist/build/pdf.worker.js";

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    pdfjsLib.getDocument(samplePDF).promise.then(function (pdfDoc_) {
      setPdfDoc(pdfDoc_);
      setPageCount(pdfDoc_?.numPages);

      // Initial/first page rendering
      renderPage(pageNum, canvas, ctx);
    });
  }, [pageNum]);

  return (
    <>
      <div>
        <button onClick={onPrevPage}>Prev</button>
        <button onClick={onNextPage}>Next</button>
        <div id="page_num">
          {pageNum}/{pageCount}
        </div>
        <div id="page_count"></div>
      </div>
      <canvas ref={canvasRef} />
    </>
  );
}

export default App;
