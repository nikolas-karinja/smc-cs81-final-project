import * as THREE from './three.js'
import { OrbitControls } from './OrbitControls.js';

class Renderer
{
    constructor ()
    {   
        this.spin = true; // is cube spinning 
        this.spinFactor = 1; // how fast
        this.portWidth = 256; // width of pv in pixels
        this.portHeight = 128; // height of pv in pixels

        // materials to cycle through
        this.materials = [
            new THREE.MeshPhongMaterial({color: 0x00cc00}),
            new THREE.MeshNormalMaterial(),
            new THREE.MeshBasicMaterial({color: 0xff00ff}),
        ];
        this.currentMatIndex = Math.floor(Math.random() * this.materials.length); // random index at start

        this.Scene = new THREE.Scene(); // main scene
        this.Camera = new THREE.PerspectiveCamera(60, this.windowAspect, 0.01, 1000); // reg cam
        this.Renderer = new THREE.WebGLRenderer({alpha: true}); // main renderer
        this.Cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), this.materials[this.currentMatIndex]); // cube
        this.Light = new THREE.DirectionalLight(0xffffff, 3); // main light
        this.Controls = new OrbitControls(this.Camera, this.Renderer.domElement) // interactive controls
        this.Grid = new THREE.GridHelper(16, 16, 0x00ff00, 0xcccccc); // grid mesh

        this.PortCamera = new THREE.PerspectiveCamera(45, this.portAspect, 0.01, 1000); // pv cam
        this.PortRenderer = new THREE.WebGLRenderer({alpha: true}); // pv renderer

        // buttons dom
        this.SpinButton = document.getElementById("spin");
        this.MatButton = document.getElementById("mat");
        this.LightButton = document.getElementById("light");
    }

    get portAspect ()
    {
        return this.portWidth / this.portHeight;
    }

    get windowAspect ()
    {
        return window.innerWidth / window.innerHeight;
    }

    Init ()
    {
        this.#SetupThree();
        this.#SetupDom();
        this.#SetupEvents();
        this.#Loop();
    }

    #Loop ()
    {
        requestAnimationFrame(() =>
        {
            // rotate cube if it's supposed to spin
            if (this.spin)
            {
                this.Cube.rotation.x += 0.01 * this.spinFactor;  
                this.Cube.rotation.y += 0.01 * this.spinFactor;
                this.Cube.rotation.z += 0.01 * this.spinFactor;
            }

            // RENDER
            this.Grid.visible = true; // reset grid visibilty

            this.Renderer.render(this.Scene, this.Camera);

            this.Grid.visible = false; // make sure grid is invisible before pv renders

            this.PortRenderer.render(this.Scene, this.PortCamera);

            // CONTROLS
            this.Controls.update();

            this.#Loop() // repeat
        })
    }

    Resize ()
    {
        // resize main cam
        this.Camera.aspect = this.windowAspect;
        this.Camera.updateProjectionMatrix();

        // resize main renderer
        this.Renderer.setSize(window.innerWidth, window.innerHeight);
    }

    #SetupDom ()
    {
        this.#UpdateSpinLabel();
    }

    #SetupEvents ()
    {
        window.addEventListener("resize", () =>
        {
            this.Resize();
        })

        this.SpinButton.addEventListener("click", () =>
        {
            this.spin = !this.spin; // toggle spinning
            this.#UpdateSpinLabel();
        })

        this.MatButton.addEventListener("click", () =>
        {
            this.currentMatIndex++;
            
            if (this.currentMatIndex > this.materials.length - 1)
                this.currentMatIndex = 0;

            this.Cube.material = this.materials[this.currentMatIndex];
        })

        this.LightButton.addEventListener("click", () =>
        {
            this.Light.intensity = Math.random() * 10;
            this.Light.position.copy(new THREE.Vector3(
                Math.random() * 10, Math.random() * 10, Math.random() * 10));
        })
    }

    #SetupThree ()
    {
        // CAMERAS
        this.Camera.position.set(8, 8, 8);
        this.Camera.lookAt(new THREE.Vector3());

        this.PortCamera.position.set(-4, 0, -4);
        this.PortCamera.lookAt(new THREE.Vector3());

        // SCENE
        this.Scene.add(this.Cube);
        this.Scene.add(this.Light);
        this.Scene.add(this.Grid);

        // CONTROLS
        this.Controls.enableDamping = true;

        // RENDERER
        this.Renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById("renderer").appendChild(this.Renderer.domElement);
        document.getElementById("port").appendChild(this.PortRenderer.domElement);
    }

    #UpdateSpinLabel ()
    {
        if (this.spin)
            this.SpinButton.innerHTML = "Stop Spinning";
        else
            this.SpinButton.innerHTML = "Spin";
    }
}

export { Renderer }