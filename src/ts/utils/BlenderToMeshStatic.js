		// // console.log(gltf.scene );
		// const nurbMesh = gltf.scene.children.filter(x => x.name === "NurbsPath001")[0];
		// // console.log(nurbMesh);
		// nurbMesh.material.side = THREE.DoubleSide;
		// gltf.scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('blue'), wireframe: true });

		// // =============== CURVA =======================================
		// // https://baronwatts.com/exporting-a-curve-from-blender-to-three-js/
		// var points: any = [

		// 	[-21.732711791992188, 19.941911697387695, 0.0],
		// 	[-4.315685272216797, 13.730247497558594, 0.0],
		// 	[9.551197052001953, 35.558509826660156, 0.0],
		// 	[11.256680488586426, 61.185218811035156, -0.14757803082466125],
		// 	[-12.872454643249512, 68.92658996582031, 2.9200217723846436],
		// 	[-30.36872100830078, 62.56190490722656, 5.1126790046691895],
		// 	[-44.78293228149414, 43.932373046875, 6.8836750984191895],
		// 	[-36.22930145263672, -45.855926513671875, 5.565949440002441],
		// 	[-42.83015441894531, -90.60613250732422, 23.768539428710938],
		// 	[-80.21492004394531, -160.798095703125, 5.16519832611084],

		// ]

		// //========== scale the curve to make it as large as you want
		// var scale = 1;
		// //========== Convert the array of points into vertices (in Blender the z axis is UP so we swap the z and y)
		// for (var i = 0; i < points.length; i++) {
		// 	var x = points[i][0] * scale;
		// 	var y = points[i][1] * scale;
		// 	var z = points[i][2] * scale;
		// 	points[i] = new THREE.Vector3(x, z, -y);
		// }
		// //========== Create a path from the points
		// var curvePath = new THREE.CatmullRomCurve3(points);
		// var radius = .25;
		// //========== Create a tube geometry that represents our curve
		// var geometry = new THREE.TubeGeometry(curvePath, 600, radius, 10, false);
		// //========== Set a different color for each face of the tube. (a triangle represents 1 face in WebGL)
		// for (var i = 0, j = geometry.faces.length; i < j; i++) {
		// 	geometry.faces[i].color = new THREE.Color("hsl(" + Math.floor(Math.random() * 290) + ",50%,50%)");
		// }
		// //========== add tube to the scene
		// var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, side: THREE.DoubleSide, transparent: true, opacity: 1 });
		// var tube = new THREE.Mesh(geometry, material);
		// gltf.scene.add(tube);
		// // ============== FIN CURVA ====================
