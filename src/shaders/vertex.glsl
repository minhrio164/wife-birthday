varying vec2 vUv;

attribute vec3 aInitialPosition;
attribute float aMeshSpeed;
attribute float aIntroDelay;
attribute vec4 aTextureCoords;
attribute float aImageAspect;


uniform float uTime;
uniform float uIntroTime;
uniform vec2 uMaxXdisplacement;
uniform vec2 uDrag;

uniform float uSpeedY;
uniform float uScrollY;


varying float vVisibility;
varying float vIntroProgress;
varying vec4 vTextureCoords;
varying float vImageAspect;


//linear smoothstep
float remap(float value, float originMin, float originMax)
{
    return clamp((value - originMin) / (originMax - originMin),0.,1.);
}

void main()
{     
    float introProgress = smoothstep(aIntroDelay, aIntroDelay + 0.85, uIntroTime);
    float introScale = mix(0.15, 1.0, introProgress);

    vec3 cardPosition = position * introScale;
    vec3 newPosition = cardPosition + aInitialPosition;


    float maxX = uMaxXdisplacement.x;
    float maxY = uMaxXdisplacement.y;

    float maxYoffset = distance(aInitialPosition.y,maxY);
    float minYoffset = distance(aInitialPosition.y,-maxY);

    
    float maxXoffset = distance(aInitialPosition.x,maxX);
    float minXoffset = distance(aInitialPosition.x,-maxX);
    
    
    float xDisplacement = mod(minXoffset -uDrag.x + uTime * aMeshSpeed, maxXoffset+minXoffset) - minXoffset;
    float yDisplacement = mod(minYoffset -uDrag.y, maxYoffset+minYoffset) - minYoffset;

    
    float maxZ = 12.;
    float minZ = -30.;
    
    float maxZoffset = distance(aInitialPosition.z,maxZ);    
    float minZoffset = distance(aInitialPosition.z,minZ);    
    
    float zDisplacement = mod(uScrollY + minZoffset,maxZoffset + minZoffset ) - minZoffset;    
    
    newPosition.x += xDisplacement; 
    newPosition.y += yDisplacement;
    newPosition.z += zDisplacement - (1.0 - introProgress) * 4.0;


    vVisibility = remap(newPosition.z, minZ, minZ+5.);
    vIntroProgress = introProgress;
    



    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(newPosition, 1.0);        


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;    

    vUv = uv;
    vTextureCoords = aTextureCoords;
    vImageAspect = aImageAspect;
}
