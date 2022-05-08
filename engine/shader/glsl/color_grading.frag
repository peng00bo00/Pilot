#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color         = subpassLoad(in_color).rgba;

    // find the level with color.b
    highp float width = float(lut_tex_size.x);
    highp float n_slices = width / _COLORS;

    highp float l = color.b * (n_slices-1.f);

    // texture coordinates
    highp float v = color.g;
    
    // uv1
    highp float u1 = _COLORS * color.r + floor(l) * _COLORS;
    u1 = u1 / width;

    highp vec2 uv1 = vec2(u1, v);
    highp vec3 c1  = texture(color_grading_lut_texture_sampler, uv1).rgb;

    // uv2
    highp float u2 = _COLORS * color.r + ceil(l) * _COLORS;
    u2 = u2 / width;
    
    highp vec2 uv2 = vec2(u2, v);
    highp vec3 c2  = texture(color_grading_lut_texture_sampler, uv2).rgb;

    // mix the color
    highp float a = l - floor(l);
    out_color.rgb = mix(c1, c2, a);
    out_color.a = color.a;

    // out_color = color;
}
