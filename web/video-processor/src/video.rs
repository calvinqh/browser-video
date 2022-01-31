use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use wasm_bindgen::JsCast;
use web_sys::console;

#[wasm_bindgen]
pub struct VideoMediaProxy {
    ms: web_sys::MediaStream,
    video_decoder: web_sys::HtmlVideoElement,
    intermediary_canvas: web_sys::HtmlCanvasElement,
}

#[wasm_bindgen]
impl VideoMediaProxy {
    pub fn new(
        ms: web_sys::MediaStream,
        output_canvas: web_sys::HtmlCanvasElement,
        canvas_height: u32,
        canvas_width: u32 
    ) -> VideoMediaProxy {
        let document = web_sys::window()
            .expect("Could not retrieve window object")
            .document()
            .expect("Could not retrieve document from window object");

        // currently there is no way to use the media stream to the canvas directly
        // will have to use HtmlVideoElement to decode the media stream for us
        let video_decoder = document
            .create_element("video")
            .expect("Could not create video element from document")
            .dyn_into::<web_sys::HtmlVideoElement>()
            .expect("Could not convert video element into HtmlVideoElement");
        video_decoder.set_autoplay(true);

        // update media stream
        // update the video decoder src
        video_decoder.set_src_object(Some(&ms));

        // we also have to use an intermediary_canvas in order to manipulate frame data
        // from the video decoder
        let intermediary_canvas = document
            .create_element("canvas")
            .expect("Could not create intermediary canvas element from document")
            .dyn_into::<web_sys::HtmlCanvasElement>()
            .expect("Could not convert canvas element into HtmlCanvasElement");
        intermediary_canvas.set_height(canvas_height);
        intermediary_canvas.set_width(canvas_width);
        console::log_3(
            &"Canvas dimensions: width x height -> ".into(),
            &intermediary_canvas.width().into(),
            &intermediary_canvas.height().into(),
        );

        VideoMediaProxy {
            ms,
            intermediary_canvas,
            video_decoder,
        }
    }

/*
    pub fn new(
        ms: web_sys::MediaStream,
        output_canvas: web_sys::HtmlCanvasElement,
    ) -> VideoMediaProxy {
        let document = web_sys::window()
            .expect("Could not retrieve window object")
            .document()
            .expect("Could not retrieve document from window object");

        // currently there is no way to use the media stream to the canvas directly
        // will have to use HtmlVideoElement to decode the media stream for us
        let video_decoder = document
            .create_element("video")
            .expect("Could not create video element from document")
            .dyn_into::<web_sys::HtmlVideoElement>()
            .expect("Could not convert video element into HtmlVideoElement");
        video_decoder.set_autoplay(true);

        // update media stream
        // update the video decoder src
        video_decoder.set_src_object(Some(&ms));

        // we also have to use an intermediary_canvas in order to manipulate frame data
        // from the video decoder
        let intermediary_canvas = document
            .create_element("canvas")
            .expect("Could not create intermediary canvas element from document")
            .dyn_into::<web_sys::HtmlCanvasElement>()
            .expect("Could not convert canvas element into HtmlCanvasElement");
        intermediary_canvas.set_height(output_canvas.height());
        intermediary_canvas.set_width(output_canvas.width());

        VideoMediaProxy {
            ms,
            intermediary_canvas,
            video_decoder,
        }
    }
*/
    pub fn set_intermediary_context_size(&mut self, width: u32, height: u32) {
        self.intermediary_canvas.set_height(height);
        self.intermediary_canvas.set_width(width);
        console::log_3(
            &"Canvas dimensions: width x height -> ".into(),
            &self.intermediary_canvas.width().into(),
            &self.intermediary_canvas.height().into(),
        );
    }

    pub fn get_frame(&mut self) -> Result<web_sys::ImageData, JsValue> {
        let ic_context = Self::get_canvas_2d_context(&self.intermediary_canvas);
        let video_width = self.video_decoder.video_width() as f64;
        let video_height = self.video_decoder.video_height() as f64;
        ic_context
            .draw_image_with_html_video_element_and_dw_and_dh(
                self.video_decoder.as_ref(),
                0f64,
                0f64,
                video_width,
                video_height,
            )
            .expect("Unable to draw video decoder content to IC context");

        let ic_width = self.intermediary_canvas.width();
        let ic_height = self.intermediary_canvas.height();

        let frame = ic_context
            .get_image_data(0f64, 0f64, ic_width as f64, ic_height as f64)
            .expect("Unable to get image data from IC context");

        return Ok(frame);
    }

    fn get_canvas_2d_context(
        canvas_element: &web_sys::HtmlCanvasElement,
    ) -> web_sys::CanvasRenderingContext2d {
        canvas_element
            .get_context("2d")
            .expect("Unable to get 2d context from canvas")
            .expect("There was no 2d context for the canvas")
            .dyn_into::<web_sys::CanvasRenderingContext2d>()
            .expect("Could not convert 2d context object to canvas 2d context.")
    }
}
