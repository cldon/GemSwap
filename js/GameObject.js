"use strict"; 
const GameObject = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0; 
  this.scale = new Vec3(1, 1, 1); 

  this.modelMatrix = new Mat4(); 

  this.parent = null; 

  this.gridX = 0;
  this.gridY = 0;

  this.type = 0;

  this.move = function(){};
  this.control = function(){};
  this.force = new Vec3();
  this.torque = 0;
  this.velocity = new Vec3();
  this.invMass = 1;
  this.backDrag = 1;
  this.sideDrag = 1;
  this.angularVelocity = 0;
  this.angularDrag = 1;
};

GameObject.prototype.updateModelMatrix =
                              function(){ 
  this.modelMatrix.set().
    scale(this.scale).
    rotate(this.orientation).
    translate(this.position);

  if (this.parent) {
    this.parent.updateModelMatrix();
    this.modelMatrix.mul(this.parent.modelMatrix);
  }
};

GameObject.prototype.draw = function(camera){ 

  this.updateModelMatrix();
  Uniforms.trafo.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
  this.mesh.draw(); 
};
