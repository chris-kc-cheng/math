# CoMER handwriting model

Files copied without modification from:
https://github.com/kimseungdae/ink-on/tree/2585994ee11fe2ed98065c555c4aae8ee9096209/public/models/comer

Upstream: ink-on by kimseungdae, Apache-2.0 (see LICENSE).
Model architecture: CoMER, ECCV 2022, https://github.com/Green-Wood/CoMER

encoder_int8.onnx and decoder_int8.onnx are trained, INT8-quantized weights.
They transcribe handwriting only. Our exact arithmetic solver remains separate.

The upstream repository reports 36.41% full-expression accuracy on CROHME
2014 for its quantized pipeline. This is not an accuracy claim for this app;
recognition must be reviewed, especially with children's handwriting.
