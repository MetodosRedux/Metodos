# **Code for the Avatar studio**


> [!IMPORTANT]
> The branches were merged apr 17. 2024. <br>
> in the code here Bootstrap and three is imported using node

In case of needing to update three.js:
run gulp in terminal
change  dist/mjs/BufferGeometryUtils,
        dist/mjs/GLTFLoader,
        dist/mjs/OrbitControls 
        'three' imports to './three.module.js'
        and change in GLTFLoader import toTrianglesDrawMode  to './BufferGeometryUtils.js';
