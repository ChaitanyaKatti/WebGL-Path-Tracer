#version 300 es
precision highp float;

#define PI 3.14159265359
#define MAX_RAY_DEPTH 10

uniform sampler2D uFrameAccumulator;
uniform samplerCube uSkybox;
uniform int uFrameCount;
uniform float uAspectRatio;
uniform float uFOV;
uniform vec3 uCameraPos;
uniform vec3 uCameraLookAt;
uniform float uFocalDistance;
uniform float uAperture;

in vec2 vTexCoord;
out vec4 fragColor;


float rand1(float n){
    return fract(sin(n) * 43758.5453123);
}

float noise(float p){
	float fl = floor(p);
    float fc = fract(p);
	return mix(rand1(fl), rand1(fl + 1.0), fc);
}

vec2 rand2(float t){
    return vec2(fract(sin(t) * 43758.5453), fract(cos(t) * 43758.5453));
}




struct Ray {
    vec3 origin;
    vec3 direction;
    vec3 color; // accumulated color
    int depth; // recursion depth
    bool inside; // is the ray inside a solid object, used for refraction
};

struct Material {
    vec3 color;
    float metallic;
    float roughness;
    float alpha;
    float ior;
    float emissivity;
};

struct Sphere {
    // Geometry
    vec3 center;
    float radius;
    // Material
    Material material;    
};

struct Plane {
    vec3 normal;
    float distance;
    vec3 color;
    float reflectivity;
    float refractivity;
    float ior;
};

struct Hit {
    // Geometry
    bool hit;
    float t;
    vec3 position;
    vec3 normal;

    // Material
    Material material;
};

float intersectPlane(Ray ray, Plane plane){
    float t = dot(plane.normal, plane.distance - ray.origin) / dot(plane.normal, ray.direction);
    if (t < 0.0){
        return -1.0;
    }
    return t;
}

Hit intersectSphere(Ray ray, Sphere sphere){
    Hit hit;
    hit.hit = false;
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * dot(oc, ray.direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant > 0.0){ // Two real roots
        float t = (-b - sqrt(discriminant)) / (2.0 * a);
        if (t > 0.0){ // First root
            hit.hit = true;
            hit.t = t;
            hit.position = ray.origin + t * ray.direction;
            hit.normal = normalize(hit.position - sphere.center);
            // Material
            hit.material.color = sphere.material.color;
            hit.material.metallic = sphere.material.metallic;
            hit.material.roughness = sphere.material.roughness;
            hit.material.alpha = sphere.material.alpha;
            hit.material.emissivity = sphere.material.emissivity;
            hit.material.ior = sphere.material.ior;
            return hit;
        }
        t = (-b + sqrt(discriminant)) / (2.0 * a);
        if (t > 0.0){ // Second root
            hit.hit = true;
            hit.t = t;
            hit.position = ray.origin + t * ray.direction;
            hit.normal = normalize(hit.position - sphere.center);
            hit.material.color = sphere.material.color;
            hit.material.metallic = sphere.material.metallic;
            hit.material.roughness = sphere.material.roughness;
            hit.material.alpha = sphere.material.alpha;
            hit.material.emissivity = sphere.material.emissivity;
            hit.material.ior = sphere.material.ior;
            return hit;
        }
    }
    return hit;
}

vec3 skycolor(Ray ray){
    return texture(uSkybox, ray.direction).rgb;
}

vec3 sampleHemisphere(vec3 normal, vec2 rand){
    float r = sqrt(rand.x);
    float theta = 2.0 * PI * rand.y;
    vec3 tangent = normalize(normal.y < 0.999 ? cross(normal, vec3(0.0, 1.0, 0.0)) : cross(normal, vec3(1.0, 0.0, 0.0)));
    vec3 bitangent = cross(normal, tangent);
    return r * cos(theta) * tangent + r * sin(theta) * bitangent + sqrt(1.0 - rand.x) * normal;
}

vec4 render(){
    // Camera
    vec3 cameraUp = vec3(0.0, 1.0, 0.0); // Y Up
    vec3 cameraRight = normalize(cross(uCameraLookAt, cameraUp));
    cameraUp = normalize(cross(cameraRight, uCameraLookAt));

    // Objects
    Sphere spheres[4];
    //                  Center,                  Radius,         Color,                 Metallic,  Roughness,  Alpha,  IOR,    Emissivity
    spheres[0] = Sphere(vec3(-0.8, 0.0, 1.0),    0.2,   Material(vec3(0.9, 0.9, 0.9), 1.0,       0.0,        1.0,    1.5,    0.0)); 
    spheres[1] = Sphere(vec3(0.0, 0.0, 0.0),     0.5,   Material(vec3(0.0, 1.0, 0.0), 0.0,       0.0,        1.0,    1.5,    0.0));
    spheres[2] = Sphere(vec3(5.0, 0.0, -5.0),     0.5,   Material(vec3(0.0, 0.0, 1.0), 0.0,       0.0,        1.0,    1.5,    0.0));
    spheres[3] = Sphere(vec3(0.0, -1000.5, -1.0), 1000.0, Material(vec3(1.0, 1.0, 1.0), 0.0,       1.0,        1.0,    1.5,    0.0));

    // Ray
    Ray ray;
    vec2 jitter = uAperture*(rand2(rand1(rand1(float(uFrameCount)))) - 0.5);
    ray.origin = uCameraPos + (jitter.x * cameraRight + jitter.y * cameraUp);
    ray.color = vec3(1.0);
    
    vec3 focalPoint = uCameraPos + uFocalDistance * uCameraLookAt + uFocalDistance * tan(PI*uFOV/360.0) * (2.0*(vTexCoord.x-0.5)*cameraRight*uAspectRatio + 2.0*(vTexCoord.y-0.5)*cameraUp);
    jitter = 0.001*uFocalDistance*(2.0*rand2(rand1(float(uFrameCount))) - 1.0);
    focalPoint += jitter.x*cameraRight*uAspectRatio + jitter.y*cameraUp;
    ray.direction = normalize(focalPoint - ray.origin);
    // ray.direction = normalize(uCameraLookAt + tan(PI*uFOV/360.0)*(2.0*(jitter.x + vTexCoord.x - 0.5) * cameraRight*uAspectRatio + 2.0*(jitter.y  + vTexCoord.y - 0.5) * cameraUp));
    
    // Ray tracing
    for (int i = 0; i < MAX_RAY_DEPTH; i++){
        Hit hit;
        hit.hit = false;
        hit.t = 100000.0;

        for (int j = 0; j < 4; j++){
            Hit newHit = intersectSphere(ray, spheres[j]);
            if (newHit.hit && newHit.t < hit.t){
                hit = newHit;
            }
        }

        if (hit.hit){
            vec3 newOrigin = hit.position + 0.001 * hit.normal;
            vec3 newDir;
            vec3 newColor;
            if (hit.material.metallic > 0.0){
                newDir = reflect(ray.direction, hit.normal);
                newColor = hit.material.color;
            }
            else{
                newDir = sampleHemisphere(hit.normal, rand2(float(uFrameCount) + 100.0*vTexCoord.x + 100.0*vTexCoord.y));
                newColor = hit.material.color ;
            }
            ray.origin = newOrigin;
            ray.direction = newDir;
            ray.color *= newColor;
            ray.depth++;
            // Microfacet BRDF based calculation
            
        }
        else{
            // skybox based calculation
            ray.color *= skycolor(ray);
            break;
        }
        if (ray.depth > MAX_RAY_DEPTH){
            break;
        }

    }

    return vec4(ray.color, 1.0);
}

void main()
{   
    vec4 newColor;
    if (uFrameCount == 0){
        newColor = render();
    }
    else{
        vec4 prevColor = texture(uFrameAccumulator, vTexCoord);
        newColor = prevColor * float(uFrameCount)/float(uFrameCount+1) +  render()/float(uFrameCount+1);
    }
    newColor.a = 1.0;
    fragColor = newColor;
}
