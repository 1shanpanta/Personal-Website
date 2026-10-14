export const VERT = `#version 300 es
in vec2 position;out vec2 v;
void main(){v=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;

export const FRAG = `#version 300 es
precision highp float;
in vec2 v;out vec4 o;
uniform sampler2D u_a,u_b,u_pa,u_pb;
uniform vec2 u_res,u_mouse,u_aspA,u_aspB;
// Per shot: x haze, y zoom, z melt, w ghost strength.
uniform vec4 u_shotA,u_shotB,u_moveA,u_moveB;
// Burn: xy centre, z radius, w strength. Wash: white haze per shot (A, B).
uniform vec4 u_burn;
uniform vec2 u_wash;
uniform float u_time,u_shade,u_mix,u_add,u_flip,u_blur,u_warp;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
// Crush the mids so fog reads as black ground and the subject glows.
float grade(float g,float neg){return pow(smoothstep(.08,.95,mix(g,1.-g,neg)),1.5);}

vec2 frame(vec2 uv,float ia,float zoom,vec2 pan){
  vec2 p=uv-.5;float va=u_res.x/u_res.y;
  if(va>ia)p.y*=ia/va;else p.x*=va/ia;
  return p/zoom+pan+.5;
}

// mv: xy pan (drift and jitter), z exposure, w focus pull, all per shot.
// neg runs the plate as its negative: the reel's polarity cut.
vec3 plate(sampler2D t,sampler2D p,vec2 uv,vec2 asp,vec4 shot,vec4 mv,float blur,float neg,float wash){
  // The plate morphs: noise displacement fast enough that shapes visibly
  // flow and reshape inside a one-second shot, as on the reel.
  vec2 w=(vec2(fbm(uv*2.4+vec2(0.,u_time*.32)),fbm(uv*2.4+vec2(5.2,1.3-u_time*.27)))-.5)*shot.z;
  vec2 c=frame(uv+w,asp.x,shot.y,mv.xy);
  blur=max(blur,mv.w);
  vec3 col=vec3(lum(texture(t,c).rgb));
  // Mip levels are free blurs: a mid one for diffusion, a deep one for glow.
  float mid=lum(texture(t,c,3.5).rgb),soft=lum(texture(t,c,6.5).rgb);
  // Diffusion varies by shot, as the reel's sharpness does: near crisp on
  // some, fine detail melted into the tone around it on others. The frame
  // edge falls out of focus in step.
  col=mix(col,vec3(mid),shot.x);
  col=mix(col,vec3(soft),max(blur,smoothstep(.22,.7,length((v-.5)*vec2(1.,.8)))*(.25+shot.x)));
  col=vec3(grade(col.r,neg));
  // Highlights become wide light sources (screen blend of the deep blur).
  float glow=grade(soft,neg);
  col=1.-(1.-col)*(1.-vec3(glow*glow*.65));
  // Blown-out haze, as on the reel's white shots. It stops above the type.
  col=mix(col,vec3(1.),wash*smoothstep(.15,.7,soft)*smoothstep(u_shade-.1,u_shade+.2,v.y));
  // A second plate ghosts through, drifting against the first (lighten blend).
  if(shot.w>0.)col=max(col,vec3(grade(lum(texture(p,frame(uv*.94+.03-w*2.,asp.y,shot.y*1.1,-mv.xy)).rgb),0.)*shot.w));
  return col*mv.z;
}

void main(){
  // The cursor bends the plates around it: a bounded swirl and swell, no hole.
  vec2 asp=vec2(u_res.x/u_res.y,1.);
  vec2 mp=(v-u_mouse)*asp;
  float wr=.15*min(asp.x,1.),f=exp(-dot(mp,mp)/(wr*wr))*u_warp,s=sin(f*.9),k=cos(f*.9);
  vec2 uv=u_mouse+mat2(k,-s,s,k)*mp*(1.-.35*f)/asp;

  vec3 a=plate(u_a,u_pa,uv,u_aspA,u_shotA,u_moveA,u_blur,0.,u_wash.x);
  vec3 b=plate(u_b,u_pb,uv,u_aspB,u_shotB,u_moveB,0.,u_flip,u_wash.y);
  vec3 c=mix(a,b,u_mix);
  c=mix(c,1.-(1.-a)*(1.-b),u_add);

  // The reel's burn: a ragged dark smudge with a glowing rim, placed per shot.
  if(u_burn.w>0.){
    vec2 bp=(v-u_burn.xy)*asp;
    float r=u_burn.z,bd=length(bp)*(1.+(fbm(bp/r*.8+u_time*.25)-.5)*.9);
    c=1.-(1.-c)*(1.-exp(-pow((bd-r*1.2)/(r*.9),2.))*.5*u_burn.w);
    c=mix(c,vec3(.08),(1.-smoothstep(r*.15,r*1.25,bd))*.88*u_burn.w);
  }

  c+=smoothstep(.5,.95,fbm(v*vec2(2.2,3.)+u_time*vec2(.025,.012)))*.05*(.3+c);
  float m=length(mp);
  c+=exp(-m*m*9.)*.05;
  // Dark shots fall off at the corners; haze shots glow white there instead, as on the reel.
  vec2 q=v-.5;
  float e=dot(q,q),haze=mix(u_wash.x,u_wash.y,u_mix);
  c=mix(c*(1.-e*1.5),1.-(1.-c)*(1.-smoothstep(.08,.45,e)*.8),haze);
  // Below u_shade the frame sinks toward grey mist, dark enough that the type
  // always reads; the mist drifts, thickest between the two text columns.
  float low=1.-smoothstep(.04,u_shade,v.y);
  c*=mix(1.,.3,low);
  c+=low*smoothstep(.45,.85,fbm(v*vec2(3.,6.)+u_time*vec2(.03,.01)))*.1*(1.-abs(v.x-.55)*1.6);
  c+=(hash(v*u_res+fract(u_time)*91.)-.5)*.025;
  o=vec4(c,1.);
}`;
