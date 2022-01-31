use wasm_bindgen::prelude::*;
use web_sys::console;

pub trait FrameFilter {
    fn generate_frame(&self, input: &web_sys::ImageData) -> Result<web_sys::ImageData, JsValue>;
}

#[wasm_bindgen]
pub struct GrayscaleFilter;
#[wasm_bindgen]
impl GrayscaleFilter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GrayscaleFilter {
        GrayscaleFilter {}
    }

    /**
     * Gray scale is calculated by a specific formula.
     * https://en.wikipedia.org/wiki/Grayscale#Luma_coding_in_video_systems
     */
    pub fn calculate_grayscale_value(pixel: &[u8]) -> u8 {
        match (pixel.get(0), pixel.get(1), pixel.get(2)) {
            (Some(r), Some(g), Some(b)) => {
                let rv = r.clone() as f64 * 0.30;
                let gv = g.clone() as f64 * 0.59;
                let bv = b.clone() as f64 * 0.11;
                (rv + gv + bv) as u8
            }
            _ => {
                console::error_1(&"All bad!".into());
                0
            }
        }
    }

    pub fn generate_frame(
        &self,
        input: &web_sys::ImageData,
    ) -> Result<web_sys::ImageData, JsValue> {
        let frame_data = input.data();
        let mut new_frame_data: Vec<u8> = Vec::with_capacity(frame_data.len());

        // for every pixel (4 bytes) compute the new grayscale value
        // the 4 bytes are the RGBA values for the pixel
        let pixels = frame_data.chunks(4);
        for pixel in pixels {
            let grayscale_val = GrayscaleFilter::calculate_grayscale_value(pixel);
            new_frame_data.push(grayscale_val);
            new_frame_data.push(grayscale_val);
            new_frame_data.push(grayscale_val);
            new_frame_data.push(255); // full alpha
        }

        web_sys::ImageData::new_with_u8_clamped_array_and_sh(
            wasm_bindgen::Clamped(&new_frame_data),
            input.width(),
            input.height(),
        )
    }
}

#[wasm_bindgen]
pub struct GreenFilter;
#[wasm_bindgen]
impl GreenFilter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GreenFilter {
        GreenFilter {}
    }

    pub fn generate_frame(
        &self,
        input: &web_sys::ImageData,
    ) -> Result<web_sys::ImageData, JsValue> {
        let frame_data = input.data();
        let mut new_frame_data: Vec<u8> = Vec::with_capacity(frame_data.len());

        // for every pixel (4 bytes) compute the new grayscale value
        // the 4 bytes are the RGBA values for the pixel
        let pixels = frame_data.chunks(4);
        for pixel in pixels {
            match (pixel.get(0), pixel.get(1), pixel.get(2)) {
                (Some(r), Some(g), Some(b)) => {
                    let rv = r.clone() as f64 * 0.30;
                    let gv = g.clone() as f64 * 0.59;
                    let bv = b.clone() as f64 * 0.11;
                    new_frame_data.push(rv as u8);
                    new_frame_data.push(gv as u8);
                    new_frame_data.push(bv as u8);
                    new_frame_data.push(255); // full alpha
                }
                _ => {
                    console::error_1(&"All bad!".into());
                }
            }
        }

        web_sys::ImageData::new_with_u8_clamped_array_and_sh(
            wasm_bindgen::Clamped(&new_frame_data),
            input.width(),
            input.height(),
        )
    }
}

#[wasm_bindgen]
pub struct NoopFilter;
#[wasm_bindgen]
impl NoopFilter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> NoopFilter {
        NoopFilter {}
    }

    pub fn generate_frame(
        &self,
        input: &web_sys::ImageData,
    ) -> Result<web_sys::ImageData, JsValue> {
        Ok(input.clone())
    }
}
