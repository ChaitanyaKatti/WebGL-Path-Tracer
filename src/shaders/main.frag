#version 300 es
precision highp float;

#define PI 3.14159265359
#define BACKFACE_CULLING

int MAX_RAY_DEPTH = 12;
int SPP = 10; // Samples per pixel

uniform sampler2D uFrameAccumulator;
uniform sampler2D uSkybox;
// uniform samplerCube uSkybox;
uniform int uFrameCount;
uniform float uTime;
uniform float uAspectRatio;
uniform float uFOV;
uniform vec3 uCameraPos;
uniform vec3 uCameraLookAt;
uniform float uFocusDistance;
uniform float uAperture;
uniform float uSeed;
uniform float uExposure;

in vec2 vTexCoord;
out vec4 fragColor;

float rand1(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float p) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand1(fl), rand1(fl + 1.0), fc);
}

vec2 rand2(float t) {
    return vec2(fract(sin(t) * 43758.5453), fract(cos(t) * 43758.5453));
}

struct Ray {
    vec3 origin;
    vec3 direction;
    // vec3 color; // accumulated color
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
    vec3 center;
    float radius;
    Material material;
};
Sphere spheres[3];

struct Plane {
    vec3 normal;
    vec3 center;
    vec2 scale;
    float rotation;
    Material material;
};
Plane planes[7];


struct Hit {
    // Geometry
    bool hit;
    float t;
    vec3 position;
    vec3 normal;

    // Material
    Material material;
};

Hit intersectPlane(Ray ray, Plane plane) {
    Hit hit;
    float rDotN = dot(ray.direction, plane.normal);

#ifdef BACKFACE_CULLING
    if(rDotN > 0.0){ // Backface culling
        hit.hit = false;
        return hit;
    }
#else
    if(rDotN > 0.0){ // Reverse normal
        plane.normal = -plane.normal;
        rDotN = -rDotN;
    }
#endif

    // Account for position and scale of plane and rotation of plane
    vec3 p = plane.center - ray.origin;
    float d = dot(p, plane.normal) / rDotN;
    if(d < 0.0){
        hit.hit = false;
        return hit;
    }
    vec3 q = ray.origin + d * ray.direction;
    vec3 v = q - plane.center;
    vec3 tangent;
    if(abs(plane.normal.y) > 0.01){
        tangent = normalize(cross(plane.normal, vec3(sin(plane.rotation), 0.0, cos(plane.rotation))));
    }
    else{
        tangent = normalize(cross(plane.normal, vec3(0.0, cos(plane.rotation), sin(plane.rotation))));
    }
    vec3 bitangent = cross(plane.normal, tangent);
    vec2 v2 = vec2(dot(v, tangent), dot(v, bitangent));

    vec2 uv = v2 / plane.scale;

    if(abs(uv.x) > 0.5 || abs(uv.y) > 0.5){
        hit.hit = false;
        return hit;
    }

    hit.hit = true;
    hit.t = d;
    hit.position = q;
    hit.normal = plane.normal;
    hit.material = plane.material;
    return hit;
}

Hit intersectSphere(Ray ray, Sphere sphere) {
    Hit hit;
    hit.hit = false;
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * dot(oc, ray.direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4.0 * a * c;
    if(discriminant > 0.0) { // Two real roots
        float t = (-b - sqrt(discriminant)) / (2.0 * a);
        if(t > 0.0) { // First root
            hit.hit = true;
            hit.t = t;
            hit.position = ray.origin + t * ray.direction;
            hit.normal = normalize(hit.position - sphere.center);
            // Material
            hit.material = sphere.material;
            return hit;
        }
        t = (-b + sqrt(discriminant)) / (2.0 * a);
        if(t > 0.0) { // Second root
            hit.hit = true;
            hit.t = t;
            hit.position = ray.origin + t * ray.direction;
            hit.normal = normalize(hit.position - sphere.center);
            // Material
            hit.material = sphere.material;
            return hit;
        }
    }
    return hit;
}

vec3 sampleCosineHemisphere(vec3 normal, vec2 rand) {
    float r = sqrt(rand.x);
    float theta = 2.0 * PI * rand.y;
    vec3 tangent = normalize(normal.y < 0.999 ? cross(normal, vec3(0.0, 1.0, 0.0)) : cross(normal, vec3(1.0, 0.0, 0.0)));
    vec3 bitangent = cross(normal, tangent);
    return r * cos(theta) * tangent + r * sin(theta) * bitangent + sqrt(1.0 - rand.x) * normal;
}

// BRDF Functions
// Schlick Approximation of  Fresnel Reflectance Function
vec3 F(vec3 F0, vec3 V, vec3 H) {
    return F0 + (1.0 - F0) * pow(1.0 - dot(V, H), 5.0);
}
// GGX/Trowbridge-Reitz Model
float D(float alpha, vec3 N, vec3 H) {
    float nDotH = dot(N, H);
    float alpha2 = alpha * alpha;
    return alpha2 / (PI * pow(nDotH * nDotH * (alpha2 - 1.0) + 1.0, 2.0));
}
// Schlick-Beckmann Geometry Shadowing Function
float G1(float alpha, vec3 N, vec3 X) {
    float k = alpha / 2.0;
    return 1.0 / (dot(N, X) * (1.0 - k) + k);
    // return dot(N, X) / (dot(N, X) * (1.0 - k) + k);
}
// Smith Model
float G(float alpha, vec3 N, vec3 V, vec3 L) {
    return G1(alpha, N, V) * G1(alpha, N, L);
}
// Specular Color - Cook Torrance Model
float Specular(float alpha, vec3 F0, vec3 N, vec3 V, vec3 L, vec3 H) {
    return D(alpha, N, H) * G(alpha, N, V, L) / 4.0 ;
}

vec3 skyColor(vec3 rayDir) {
    return vec3(0.0);
    // float intensity = pow(dot(rayDir, normalize(vec3(1.0, 1.0, 1.0))), 25.0);
    // return 50.0 * vec3(intensity);
    // return texture(uSkybox, rayDir).rgb;
    // vec2 uv;
    // uv.x = atan(rayDir.z, rayDir.x) / (2.0 * PI + 0.001) + 0.5;
    // uv.y = asin(rayDir.y) / PI + 0.5;
    // vec4 rgbe = texture(uSkybox, uv);
    // rgbe.rgb *= pow(2.0, rgbe.a * 255.0 - 127.0 + uExposure);       // unpack RGBE to HDR RGB
    // return rgbe.rgb;
}

vec3 BRDF(Ray incomingRay, Ray outgoingRay, Hit hit) {
    vec3 V = -incomingRay.direction;
    vec3 L = outgoingRay.direction;
    vec3 N = hit.normal;
    vec3 H = normalize(V + L);
    vec3 F0 = hit.material.metallic * hit.material.color;
    float alpha = pow(hit.material.roughness, 2.0);
    
    if(dot(V, N) * dot(L, N) < 0.0){
        return vec3(1.0 - 0.1*F(F0, V, H));
    }

    // PBR shading
    vec3 Ks = F(F0, V, H);
    vec3 Kd = (1.0 - Ks) * (1.0 - hit.material.metallic);
    vec3 lambert = hit.material.color;

    vec3 brdf = Kd * lambert + Ks * Specular(alpha, F0, N, V, L, H);// * (hit.material.roughness*4.0);

    return brdf;
}
vec3 BTDF(Ray incomingRay, Ray outgoingRay, Hit hit) {
    vec3 V = -incomingRay.direction;
    vec3 L = outgoingRay.direction;
    vec3 H = normalize(V + L);
    vec3 F0 = vec3(0.04);
    vec3 Ks = F(F0, V, H);
    return (1.0 - Ks);
}

Ray scatter(Ray ray, Hit hit, float seed) {
    Ray newRay;
    if(hit.material.alpha > seed){ // Reflection
        newRay.origin = hit.position + 0.001 * hit.normal;
        newRay.direction = sampleCosineHemisphere(hit.normal, rand2(seed + 100.0 * vTexCoord.x + 100.0 * vTexCoord.y + 100.0 * hit.position.x));
        float imp = (1.0 - hit.material.roughness);
        newRay.direction = normalize(newRay.direction * (1.0 - imp) + reflect(ray.direction, hit.normal) * imp);
        newRay.depth = ray.depth + 1;
        return newRay;
    }
    else{ // Refraction
        float eta = hit.material.ior;
        float cosi = dot(-ray.direction, hit.normal);
        if(cosi < 0.0){ // Ray is inside the object
            cosi = -cosi;
            hit.normal = -hit.normal;
        }
        else{ // Ray is outside the object
            eta = 1.0 / eta;
        }
        float k = 1.0 - eta * eta * (1.0 - cosi * cosi);
        if(k < 0.0){ // Total internal reflection
            newRay.origin = hit.position + 0.001 * hit.normal;
            newRay.direction = reflect(ray.direction, hit.normal);
            newRay.depth = ray.depth + 1;
            return newRay;
        }
        newRay.origin = hit.position - 0.001 * hit.normal;
        newRay.direction = normalize(eta * ray.direction + (eta * cosi - sqrt(k)) * hit.normal);
        newRay.depth = ray.depth + 1;
        return newRay;
    }
}

vec3 simpleBRDF(Ray incomingRay, Ray outgoingRay, Hit hit) {
    if(dot(incomingRay.direction, outgoingRay.direction) > 0.0){
        // Refraction
        return vec3(1.0);
    }
    vec3 V = -incomingRay.direction;
    vec3 L = outgoingRay.direction;
    vec3 N = hit.normal;
    vec3 H = normalize(V + L);
    float alpha = pow(hit.material.roughness, 2.0);
    vec3 F0 = vec3(hit.material.metallic);

    vec3 Ks = F(F0, V, H);
    vec3 Kd = (1.0 - Ks) * (1.0 - hit.material.metallic);
    vec3 brdf = Kd * hit.material.color + Ks;  
    return brdf;
}



Hit computeNearestHit(Ray ray) {
    Hit hit;
    hit.hit = false;
    hit.t = 100000.0;

    for(int j = 0; j < spheres.length();j++) {
        Hit newHit = intersectSphere(ray, spheres[j]);
        if(newHit.hit && newHit.t < hit.t) {
            hit = newHit;
        }
    }
    for(int j=0; j<planes.length(); j++){
        Hit newHit = intersectPlane(ray, planes[j]);
        if(newHit.hit && newHit.t < hit.t) {
            hit = newHit;
        }
    }
    return hit;
}

vec3 trace(Ray ray, float seed) {
    vec3 color = vec3(1.0);

    while(ray.depth < MAX_RAY_DEPTH) {
        Hit hit = computeNearestHit(ray);

        if(hit.hit) {
            if (hit.material.emissivity > 0.01){
                color *= hit.material.color * hit.material.emissivity;
                break;
            }
            Ray newRay = scatter(ray, hit, seed);
            color *= BRDF(ray, newRay, hit);
            ray = newRay;
        } else {
            color *= skyColor(ray.direction);
            break;
        }
    }

    if(ray.depth == MAX_RAY_DEPTH){
        return vec3(0.0);
    }

    return color;
}

vec3 render(float seed) {
    // Camera
    vec3 cameraUp = vec3(0.0, 1.0, 0.0); // Y Up
    vec3 cameraRight = normalize(cross(uCameraLookAt, cameraUp));
    cameraUp = normalize(cross(cameraRight, uCameraLookAt));

    // Objects
    spheres[0] = Sphere(vec3(0.0, -0.3, 0.1), 0.2,                                            Material(vec3(1.0, 1.0, 1.0), 1.0, 0.01, 0.1, 1.5, 0.0));
    spheres[1] = Sphere(vec3(0.3, -0.3, -0.2), 0.2,                                           Material(vec3(0.9, 0.6, 0.1), 0.0, 0.3, 1.0, 1.5, 0.0));
    spheres[2] = Sphere(vec3(-0.3, -0.3, -0.2), 0.2,                                          Material(vec3(1.0, 1.0, 1.0), 1.0, 0.01, 1.0, 1.5, 0.0));
    planes[0] = Plane(vec3(1.0, 0.0, 0.0),      vec3(-0.5, 0.0, 0.0),   vec2(1.0, 1.0), 0.0,  Material(vec3(1.0, 0.0, 0.0), 0.0, 0.7, 1.0, 1.5, 0.0));
    planes[1] = Plane(vec3(-1.0, 0.0, 0.0),     vec3(0.5, 0.0, 0.0),    vec2(1.0, 1.0), 0.0,  Material(vec3(0.0, 1.0, 0.0), 0.0, 0.7, 1.0, 1.5, 0.0));
    planes[2] = Plane(vec3(0.0, 1.0, 0.0001),   vec3(0.0, -0.5, 0.0),   vec2(1.0, 1.0), 0.0,  Material(vec3(1.0, 1.0, 1.0), 0.0, 0.7, 1.0, 1.5, 0.0));
    planes[3] = Plane(vec3(0.0, -1.0, 0.0001),  vec3(0.0, 0.5, 0.0),    vec2(1.0, 1.0), 0.0,  Material(vec3(1.0, 1.0, 1.0), 0.0, 0.7, 1.0, 1.5, 0.0));
    planes[4] = Plane(vec3(0.0, 0.0, 1.0),      vec3(0.0, 0.0, -0.5),   vec2(1.0, 1.0), 0.0,  Material(vec3(1.0, 1.0, 1.0), 0.0, 0.7, 1.0, 1.5, 0.0));
    planes[5] = Plane(vec3(0.0, 0.0, -1.0),     vec3(0.0, 0.0, 0.5),    vec2(1.0, 1.0), 0.0,  Material(vec3(1.0, 1.0, 1.0), 0.0, 0.7, 1.0, 1.5, 0.0));
    planes[6] = Plane(vec3(0.0, -1.0, 0.0001),  vec3(0.0, 0.49, 0.0),   vec2(0.4, 0.4), 0.0,  Material(vec3(1.0, 1.0, 1.0), 0.0, 0.7, 1.0, 1.5, 5.0));
    
    // Ray
    Ray ray;
    ray.depth = 0;
    vec2 jitter = uAperture * 0.00 * (rand2(seed) - 0.5);
    ray.origin = uCameraPos + (jitter.x * cameraRight + jitter.y * cameraUp);

    vec3 focalPoint = uCameraPos + uFocusDistance * uCameraLookAt + uFocusDistance * tan(PI * uFOV / 360.0) * (2.0 * (vTexCoord.x - 0.5) * cameraRight * uAspectRatio + 2.0 * (vTexCoord.y - 0.5) * cameraUp);
    jitter = 0.001 * uFocusDistance * tan(PI * uFOV / 360.0) * (2.0 * rand2(seed) - 1.0);
    focalPoint += jitter.x * cameraRight * uAspectRatio + jitter.y * cameraUp;
    ray.direction = normalize(focalPoint - ray.origin);

    return trace(ray, seed);
}

void main() {
    vec3 newColor;
    if(uFrameCount == 0) {
        SPP = 1;
        MAX_RAY_DEPTH = 4;
    }

    for(int i = 0;i < SPP; i++) {
        newColor += render(rand1(uSeed + 10.0 * vTexCoord.x + 10.0 * vTexCoord.y + float(i)));
    }
    newColor /= float(SPP);
    newColor = clamp(newColor, vec3(0.0), vec3(1.0));

    if(uFrameCount == 0) {
        fragColor = vec4(newColor, 1.0);
    } else {
        vec4 prevColor = texture(uFrameAccumulator, vTexCoord);
        // fragColor = prevColor * (0.99) + vec4(newColor, 1.0)*(0.01);
        fragColor = prevColor * (float(uFrameCount) / float(uFrameCount + 1)) + vec4(newColor, 1.0) / float(uFrameCount + 1);
    }
}
