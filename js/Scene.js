"use strict";
const Scene = function(gl) {
	this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured_vs.essl");
	this.vsBackground = new Shader(gl, gl.VERTEX_SHADER, "background_vs.essl");  
	this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
	this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured);
	this.backgroundProgram = new TexturedProgram(gl, this.vsBackground, this.fsTextured);  

	this.quadGeometry = new TexturedQuadGeometry(gl);

	this.pugMaterial = new Material(gl, this.texturedProgram);
	this.pugMaterial.colorTexture.set(new Texture2D(gl, "media/pug.png"));
	this.pugMesh = new Mesh(this.quadGeometry, this.pugMaterial);

	this.pomMaterial = new Material(gl, this.texturedProgram);
	this.pomMaterial.colorTexture.set(new Texture2D(gl, "media/pom.png"));
	this.pomMesh = new Mesh(this.quadGeometry, this.pomMaterial);

	this.dalMaterial = new Material(gl, this.texturedProgram);
	this.dalMaterial.colorTexture.set(new Texture2D(gl, "media/dal.png"));
	this.dalMesh = new Mesh(this.quadGeometry, this.dalMaterial);

	this.corgMaterial = new Material(gl, this.texturedProgram);
	this.corgMaterial.colorTexture.set(new Texture2D(gl, "media/corg.png"));
	this.corgMesh = new Mesh(this.quadGeometry, this.corgMaterial);

	this.brownMaterial = new Material(gl, this.texturedProgram);
	this.brownMaterial.colorTexture.set(new Texture2D(gl, "media/brown.png"));
	this.brownMesh = new Mesh(this.quadGeometry, this.brownMaterial);

	this.boxMaterial = new Material(gl, this.texturedProgram);
	this.boxMaterial.colorTexture.set(new Texture2D(gl, "media/box.png"));
	this.boxMesh = new Mesh(this.quadGeometry, this.boxMaterial);

	this.bigMaterial = new Material(gl, this.texturedProgram);
	this.bigMaterial.colorTexture.set(new Texture2D(gl, "media/big.png"));
	this.bigMesh = new Mesh(this.quadGeometry, this.bigMaterial);

	this.sitMaterial = new Material(gl, this.texturedProgram);
	this.sitMaterial.colorTexture.set(new Texture2D(gl, "media/sit.png"));
	this.sitMesh = new Mesh(this.quadGeometry, this.sitMaterial);

	this.dogMeshes = [this.pugMesh, this.pomMesh, this.dalMesh, this.corgMesh, this.brownMesh, this.boxMesh, this.bigMesh, this.sitMesh];

	this.gridSize = 10;
	
	this.toDelete = []

	this.gameObjects = [];

	this.pieces = [];
	this.selectedPiece = null;

	for (var i = 0; i < this.gridSize; i++) {
		var row = [];
		for (var j = 0; j < this.gridSize; j++) {
				var type = Math.floor(Math.random() * this.dogMeshes.length);
				var newDog = new GameObject(this.dogMeshes[type]);
				newDog.position.set((i - 5)*1.8+1.8, (j - 5)*1.8+1)
				newDog.scale = .8
				newDog.gridX = i;
				newDog.gridY = j;
				newDog.type = type;
				newDog.xLoc = i;
				newDog.yLoc = j;
				row.push(newDog);
		}
		this.pieces.push(row);
	}

	this.backgroundMaterial = new Material(gl, this.backgroundProgram);
	this.backgroundMaterial.colorTexture.set(new Texture2D(gl, "media/blue.png"));
	this.backgroundMesh = new Mesh(this.quadGeometry, this.backgroundMaterial);
	this.background = new GameObject( this.backgroundMesh );
	this.gameObjects.push(this.background);

	// this.raiderMaterial = new Material(gl, this.texturedProgram);
	// this.raiderMaterial.colorTexture.set(new Texture2D(gl, "media/raider.png"));
	// this.raiderMesh = new Mesh(this.quadGeometry, this.raiderMaterial);
	// this.avatar = new GameObject( this.raiderMesh );
	// this.avatar.position.set(-13, -13)
	// this.gameObjects.push(this.avatar);

	this.mouseX = -5
	this.mouseY = -5

	this.asteroidMaterial = new Material(gl, this.texturedProgram);
	this.asteroidMaterial.colorTexture.set(new Texture2D(gl, "media/asteroid.png"));
	this.asteroidMesh = new Mesh(this.quadGeometry, this.asteroidMaterial);
	const genericMove = function(t, dt){
		const acceleration = new Vec3(this.force).
					mul(this.invMass);

		this.velocity.addScaled(dt, acceleration);
		this.position.addScaled(dt, this.velocity);
	};

	// const avatarMove = function(t, dt) {
	// 	const acceleration = new Vec3(this.force).
	// 				mul(this.invMass);

	// 	this.velocity.addScaled(dt, acceleration);

	// 	this.position.addScaled(dt, this.velocity);

	// 	const angularAcceleration = this.torque * this.invAngularMass;
	// 	// this.angularVelocity *= this.angularDrag;
	// 	// console.log(this.angularVelocity)
	// 	this.angularVelocity += angularAcceleration * dt;
		
	// 	// this.velocity.times(Math.pow(this.drag, dt));
	// 	this.orientation += this.angularVelocity * dt;
		
	// };

	this.camera = new OrthoCamera();

	this.timeAtFirstFrame = new Date().getTime();
	this.timeAtLastFrame = this.timeAtFirstFrame;


	gl.enable(gl.BLEND);
	gl.blendFunc(
		gl.SRC_ALPHA,
		gl.ONE_MINUS_SRC_ALPHA);

	this.first = true
};

Scene.prototype.dragMouse = function(mouseX, mouseY) {
	const vpi = new Mat4(this.camera.viewProjMatrix).invert();
	const mouseCoord = (new Vec2(mouseX, mouseY)).xy01times(vpi);

	this.mouseX = mouseCoord.x
	this.mouseY = mouseCoord.y

	if (this.selectedPiece != null) {
		this.selectedPiece.position.set(this.mouseX, this.mouseY)
	}
};

Scene.prototype.mouseDown = function (mouseX, mouseY, keysPressed) {
	const vpi = new Mat4(this.camera.viewProjMatrix).invert();
	const mouseCoord = (new Vec2(mouseX, mouseY)).xy01times(vpi);
	this.mouseX = mouseCoord.x
	this.mouseY = mouseCoord.y

	var gridX = Math.floor((this.mouseX / 1.8) + 4.5)
	var gridY = Math.floor((this.mouseY /1.8) + 5)

	if (this.selectedPiece == null && gridX < this.gridSize && gridX >= 0 && gridY < this.gridSize && gridY >=0) {
		if (keysPressed.B) {
			this.deletePiece(gridX, gridY)
		} else {
			this.selectedPiece = this.pieces[gridX][gridY]
		}
	}
};

Scene.prototype.deletePiece = function (i, j) {
	// this.pieces[i][j].scale = 0
	// this.pieces[i][j] = null

	const moveFunc = function (t, dt) {
    const angularAcceleration = this.torque * this.invAngularMass;
    // this.angularVelocity *= this.angularDrag;
    // console.log(this.angularVelocity)
    this.angularVelocity += angularAcceleration * dt;
    
    // this.velocity.times(Math.pow(this.drag, dt));
    this.orientation += this.angularVelocity * dt;
	}

	this.pieces[i][j].move = moveFunc
	this.pieces[i][j].torque = .5
	this.pieces[i][j].angularDrag = .999
	this.pieces[i][j].angularVelocity = 1
	this.pieces[i][j].invAngularMass = .3
	this.toDelete.push(this.pieces[i][j])
}

Scene.prototype.deleteRow = function (row, start, end) {
	console.log(row, start, end)
	for (var i = start; i <= end; i++) {
		this.deletePiece(i, row)
	}
	this.updateGrid()
}

Scene.prototype.deleteCol = function (col, start, end) {
	// console.log(row, start, end)
	for (var i = start; i <= end; i++) {
		this.deletePiece(col, i)
	}
	this.updateGrid()
}

Scene.prototype.checkCol = function (col) {
	var start = -1
	var end = -1
	for (var i = 0; i < this.gridSize - 2; i ++) {
		if (this.pieces[col][i].type == this.pieces[col][i+1].type && this.pieces[col][i].type == this.pieces[col][i+2].type) {
			if (start == -1) {
				start = i
			}
			end = i + 2

			if (end == this.gridSize - 1) {
				this.deleteCol(col, start, end)
				i = i + 2
			}
		} else {
			if (start != -1) {
				this.deleteCol(col, start, end)
				i = i + 2
				start = -1
				end = -1
			}
		}
	}
}

Scene.prototype.checkRow = function (row) {
	var start = -1
	var end = -1
	for (var i = 0; i < this.gridSize - 2; i ++) {
		if (this.pieces[i][row].type == this.pieces[i+1][row].type && this.pieces[i][row].type == this.pieces[i+2][row].type) {
			if (start == -1) {
				start = i
			}
			end = i + 2

			if (end == this.gridSize - 1) {
				this.deleteRow(row, start, end)
				i = i + 2
			}
		} else {
			if (start != -1) {
				this.deleteRow(row, start, end)
				i = i + 2
				start = -1
				end = -1
			}
		}
	}
}

Scene.prototype.findMatch = function (newX, newY) {
	// if it is a swap on the same column
	if (newX - this.selectedPiece.gridX == 0) {
		console.log("column swap")

		var c0 = this.checkRowMatch(newX, newY, this.selectedPiece.type)
		var c1 = this.checkRowMatch(this.selectedPiece.gridX, this.selectedPiece.gridY, this.pieces[newX][newY].type)

		//check two above or two below
		var mul = newY - this.selectedPiece.gridY

		//checking selector moved piece
		var c2 = newY + mul * 2 >= 0 
			&& newY + mul * 2 < this.gridSize 
			&& this.pieces[newX][newY + mul].type == this.selectedPiece.type 
			&& this.pieces[newX][newY + mul*2].type == this.selectedPiece.type

		mul = mul * -1
		// checking nonselector moved piece
		var c3 =  this.selectedPiece.gridY + mul*2 >= 0 
			&& this.selectedPiece.gridY + mul*2 < this.gridSize 
			&& this.pieces[newX][this.selectedPiece.gridY + mul].type == this.pieces[newX][newY].type
			&& this.pieces[newX][this.selectedPiece.gridY + mul*2].type == this.pieces[newX][newY].type

		console.log(c0, c1, c2, c3)
		return c0 || c1 || c2 || c3

	// otherwise it is a swap on the same row
	} else {
		console.log("row swap")

		// console.log("c1")
		var c0 = this.checkColMatch(newX, newY, this.selectedPiece.type) 
		// console.log("c2")
		var c1 = this.checkColMatch(this.selectedPiece.gridX, this.selectedPiece.gridY, this.pieces[newX][newY].type)

				//check two above or two below
		var mul = newX - this.selectedPiece.gridX

		//checking selector moved piece

		var c2 = newX + mul * 2 >= 0 
			&& newX + mul * 2 < this.gridSize 
			&& this.pieces[newX + mul][newY].type == this.selectedPiece.type 
			&& this.pieces[newX + mul*2][newY].type == this.selectedPiece.type

		mul = mul * -1
		// checking nonselector moved piece
		var c3 =  this.selectedPiece.gridX + mul*2 >= 0 
			&& this.selectedPiece.gridX + mul*2 < this.gridSize 
			&& this.pieces[this.selectedPiece.gridX + mul][newY].type == this.pieces[newX][newY].type
			&& this.pieces[this.selectedPiece.gridX + mul*2][newY].type == this.pieces[newX][newY].type
		// this.pieces[this.selectedPiece.gridX + mul][newY].scale = 1.3
		// this.pieces[this.selectedPiece.gridX + mul*2][newY].scale = 1.3
		console.log(c0, c1, c2, c3)
		return c0 || c1 || c2 || c3
	}
};

Scene.prototype.updateGrid = function() {
	for (var i = 1; i < this.gridSize; i++) {
		for (var j = 0; j < this.gridSize; j++) {
			// make sure the squre we're checking isn't empty
			if (this.pieces[j][i] != null) {
				var loc = i
				while (loc - 1 >= 0 && this.pieces[j][loc-1] == null) {
					this.pieces[j][loc-1] = this.pieces[j][i]
					this.pieces[j][loc-1].position.set((j - 5)*1.8+1.8, (loc - 1 - 5)*1.8+1)
					this.pieces[j][i].scale = 1.3
					loc -= 1
				}
			}
		}
	}
}

Scene.prototype.mouseUp = function (mouseX, mouseY) {

	const vpi = new Mat4(this.camera.viewProjMatrix).invert();
	const mouseCoord = (new Vec2(mouseX, mouseY)).xy01times(vpi);
	this.mouseX = mouseCoord.x
	this.mouseY = mouseCoord.y

	var gridX = Math.floor((this.mouseX / 1.8) + 4.5)
	var gridY = Math.floor((this.mouseY /1.8) + 5)

	// logic to make sure that piece is dropped both inside the grid and in an adjacent grid spot
	if (this.selectedPiece != null && gridX < this.gridSize && gridX >= 0 && gridY < this.gridSize && gridY >=0
		&& ((gridX == this.selectedPiece.gridX && Math.abs(gridY - this.selectedPiece.gridY) == 1)
			||(gridY == this.selectedPiece.gridY && Math.abs(gridX - this.selectedPiece.gridX) == 1))) {
		
		// check if move is legal
		if (this.findMatch(gridX, gridY)) {
			 var oldX = this.selectedPiece.gridX
			 var oldY = this.selectedPiece.gridY
			 var temp = this.pieces[gridX][gridY]

			 this.pieces[temp.gridX][temp.gridY] = this.selectedPiece
			 this.selectedPiece.gridX = temp.gridX
			 this.selectedPiece.gridY = temp.gridY

			 this.pieces[temp.gridX][temp.gridY].position.set((temp.gridX - 5)*1.8+1.8, (temp.gridY - 5)*1.8+1)
			 
			 this.pieces[oldX][oldY] = temp
			 this.pieces[oldX][oldY].gridX = oldX
			 this.pieces[oldX][oldY].gridY = oldY

			 this.pieces[oldX][oldY].position.set((oldX - 5)*1.8+1.8, (oldY - 5)*1.8+1)

			this.checkRow(oldY)
			this.checkRow(this.selectedPiece.gridY)
			this.updateGrid()
			this.checkCol(oldX)
			this.checkCol(this.selectedPiece.gridX)

			this.updateGrid()
			} else {
				this.selectedPiece.position.set((this.selectedPiece.gridX - 5)*1.8+1.8, (this.selectedPiece.gridY - 5)*1.8+1)
			}
		} else if (this.selectedPiece != null) {
		this.selectedPiece.position.set((this.selectedPiece.gridX - 5)*1.8+1.8, (this.selectedPiece.gridY - 5)*1.8+1)
	}
	this.selectedPiece = null;
}

Scene.prototype.checkRowMatch = function(i, j, type) {

	var c1 = i + 1 < 10  && i - 1 >= 0 && this.pieces[i - 1][j].type == type && this.pieces[i + 1][j].type == type
	var c2 = i - 2 >= 0 && this.pieces[i - 1][j].type == type && this.pieces[i - 2][j].type == type
	var c3 = i + 2 < 10 && this.pieces[i + 1][j].type == type && this.pieces[i + 2][j].type == type

	return c1 || c2 || c3
};

Scene.prototype.checkColMatch = function(i, j, type) {

	var c1 = j + 1 < 10  && j - 1 >= 0 && this.pieces[i][j - 1].type == type && this.pieces[i][j + 1].type == type
	var c2 = j - 2 >= 0 && this.pieces[i][j - 1].type == type && this.pieces[i][j - 2].type == type
	var c3 = j + 2 < 10 && this.pieces[i][j + 1].type == type && this.pieces[i][j + 2].type == type

	// console.log(j-2, pieces[i][j - 1].type, type)
	// console.log(j - 2 >= 0, pieces[i][j - 1].type == type, pieces[i][j - 2].type == type)
	// console.log(j - 2 >= 0, pieces[i][j + 1].type == type, pieces[i][j + 2].type == type)
	// console.log("cols: ", c1, c2, c3)
	// console.log(i, j, this.pieces, this.pieces[i][j].type, type)
	// console.log("1: ", j - 2 >= 0, this.pieces[i][j - 1].type == type, this.pieces[i][j - 2].type == type)
	// console.log("2: ", j - 2 >= 0, this.pieces[i][j - 1].type == type, this.pieces[i][j - 2].type == type)
	// console.log("3: ", j + 2 < 10, this.pieces[i][j + 1].type == type, this.pieces[i][j + 2].type == type)
	// console.log("returning", c2 || c3)
	return c1 || c2 || c3
};

Scene.prototype.selectOnMouseClick = function(mouseX, mouseY, keysPressed) {
	const vpi = new Mat4(this.camera.viewProjMatrix).invert(); // view projection matrix inversion
	const mouseCoord = (new Vec2(mouseX, mouseY)).xy01times(vpi);

	// for (var i = 0; i < this.gameObjects.length; i++) {
	//   if (((mouseCoord.x - 0.1) < this.gameObjects[i].position.x)
	//     && (this.gameObjects[i].position.x < (mouseCoord.x + 0.1))
	//     && ((mouseCoord.y - 0.1) < this.gameObjects[i].position.y)
	//     && (this.gameObjects[i].position.y < (mouseCoord.y + 0.1))) {
	//     this.selectedGameObjects.push(this.gameObjects[i]);
	//     this.gameObjects.splice(i, 1);
	//   }
	// } 


};

Scene.prototype.update = function(gl, keysPressed) {

	if (this.first) {
		// console.log("checking rows")
		for (let i = 0; i < this.gridSize; i++) {
			this.checkRow(i)
		}

		for (let i = 0; i < this.gridSize; i++) {
			this.checkCol(i)
		}

		this.first = false
	}
	//jshint bitwise:false
	//jshint unused:false
	const timeAtThisFrame = new Date().getTime();
	const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
	const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
	this.timeAtLastFrame = timeAtThisFrame;

	// clear the screen
	gl.clearColor(0.3, 0.0, 0.3, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	for (let i = 0; i < this.gameObjects.length; i++) {
		this.gameObjects[i].control(t, dt, keysPressed, this.gameObjects);
	}

	for (let i = 0; i < this.toDelete.length; i++) {
		this.toDelete[i].move(t, dt);
	}

	// this.camera.position = this.avatar.position;
	this.camera.updateViewProjMatrix();

	Uniforms.trafo.viewProjMatrixInverse.set(this.camera.viewProjMatrix).invert();

	for (let i = 0; i < this.gameObjects.length; i++) {
		this.gameObjects[i].draw(this.camera);
	}

	for (let i = 0; i < this.gridSize; i++) {
			for (let j = 0; j < this.gridSize; j++)
				this.pieces[i][j].draw(this.camera);
	}

	for(let i = this.toDelete.length - 1; i >= 0; i--) {
		this.toDelete[i].scale -= 0.005
		if (this.toDelete[i].scale < .0005) {
			console.log("should remove now")
			this.toDelete.splice(i, 1)
		}
 	}

};


