varying vec2 vUv;
varying float vVisibility;
varying float vIntroProgress;
varying vec4 vTextureCoords;
varying float vImageAspect;

uniform sampler2D uWrapperTexture;
uniform sampler2D uAtlas;
uniform sampler2D uBlurryAtlas;


float roundedRectMask(vec2 point, vec2 bottomLeft, vec2 topRight, float radius)
{
    vec2 halfSize = (topRight - bottomLeft) * 0.5;
    vec2 center = (bottomLeft + topRight) * 0.5;
    vec2 q = abs(point - center) - halfSize + vec2(radius);
    float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(0.0, 0.004, dist);
}


void main()
{            
                    
    vec4 texel = texture2D(uWrapperTexture, vUv);

    
    if(texel.a==0.) discard;
            


    // Get UV coordinates for this image from the uniform array
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

    vec2 imageBottomLeft = vec2(0.055, 0.335);
    vec2 imageTopRight = vec2(0.945, 0.978);
    vec2 imageUv = clamp(
        (vUv - imageBottomLeft) / (imageTopRight - imageBottomLeft),
        0.,
        1.
    );

    float cardAspect = 2.0 / 3.38;
    float imageRectAspect = cardAspect * (imageTopRight.x - imageBottomLeft.x) / (imageTopRight.y - imageBottomLeft.y);
    float visibleX = min(1.0, imageRectAspect / vImageAspect);
    float visibleY = min(1.0, vImageAspect / imageRectAspect);
    vec2 coverUv = vec2(
        (imageUv.x - 0.5) * visibleX + 0.5,
        (imageUv.y - 0.5) * visibleY + 0.5
    );

    vec2 atlasUV = vec2(
        mix(xStart, xEnd, coverUv.x),
        mix(yStart, yEnd, 1. - coverUv.y)
    );

    
    vec4 blurryTexel = texture2D(uBlurryAtlas, atlasUV);

    // Sample the texture
    vec4 color = texture2D(uAtlas, atlasUV);
    float imageMask = roundedRectMask(vUv, imageBottomLeft, imageTopRight, 0.045);
    color = mix(texel + blurryTexel * 0.8, color, imageMask);

    color.a *= vVisibility * vIntroProgress;

    color.r = min(color.r, 1.);
    color.g = min(color.g, 1.);
    color.b = min(color.b, 1.);

    gl_FragColor = color;
}
