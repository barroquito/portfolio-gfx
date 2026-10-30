"""Build the editable turntable and its web-ready GLB.

Run with Blender: blender -b --python tools/build-turntable.py -- MODEL.glb MODEL.blend
The Blender studio is for authoring; only the named model is exported.
"""
import bpy
import math
import random
import sys
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
glb_path, blend_path = args[0], args[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for material in bpy.data.materials:
    bpy.data.materials.remove(material)

def srgb(c):
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4

def color(hex_value):
    return tuple(srgb(int(hex_value[i:i+2], 16) / 255) for i in (1, 3, 5)) + (1,)

def material(name, hex_value, metallic=0, roughness=.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = color(hex_value)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return m

graphite = material('01 · Anodizado grafito', '#434845', .76, .34)
edge = material('02 · Aluminio satinado', '#a3aaa6', .86, .30)
edge_dark = material('03 · Aluminio oscuro', '#656e6a', .8, .31)
chassis = material('04 · Chasis de grafito', '#222725', .26, .35)
rubber = material('05 · Caucho mate', '#161b19', .02, .91)
mat_rubber = material('06 · Alfombrilla', '#303735', .03, .83)
groove = material('07 · Relieve de la alfombrilla', '#3c4541', .06, .70)
black = material('08 · Polímero negro', '#111715', .10, .38)
white = material('09 · Marcas marfil', '#ecece3', .08, .62)
red = material('10 · Acento rojo', '#c62821', .08, .38)
needle_metal = material('11 · Aguja metálica', '#d3d6cf', .92, .22)

# A restrained, real image texture survives glTF export. Tiny irregular lines
# in the dark metal break up the perfectly flat digital surface.
size = 512
rng = random.Random(1234)
image = bpy.data.images.new('Anodizado · textura cepillada', width=size, height=size, alpha=True)
pixels = []
for y in range(size):
    line = rng.uniform(-.011, .011)
    for x in range(size):
        grain = rng.uniform(-.006, .006) + line
        pixels.extend((max(0, .263+grain), max(0, .282+grain), max(0, .271+grain), 1.0))
image.pixels.foreach_set(pixels)
image.pack()
nodes = graphite.node_tree.nodes
tex = nodes.new('ShaderNodeTexImage')
tex.name = 'Microvariación cepillada'
tex.image = image
graphite.node_tree.links.new(tex.outputs['Color'], nodes.get('Principled BSDF').inputs['Base Color'])

mat_image = bpy.data.images.new('Tapete · grano de goma', width=size, height=size, alpha=True)
pixels = []
for y in range(size):
    for x in range(size):
        grain = rng.uniform(-.007, .007)
        pixels.extend((.18+grain, .195+grain, .188+grain, 1.0))
mat_image.pixels.foreach_set(pixels)
mat_image.pack()
nodes = mat_rubber.node_tree.nodes
tex = nodes.new('ShaderNodeTexImage')
tex.name = 'Grano fino de goma'
tex.image = mat_image
mat_rubber.node_tree.links.new(tex.outputs['Color'], nodes.get('Principled BSDF').inputs['Base Color'])

model_collection = bpy.data.collections.new('TOCADISCOS · MODELO')
bpy.context.scene.collection.children.link(model_collection)
model_objects = []

def adopt(obj, name, mat=None, parent=None):
    obj.name = name
    for coll in list(obj.users_collection):
        coll.objects.unlink(obj)
    model_collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        world = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world
    model_objects.append(obj)
    return obj

def bevel(obj, amount, segments=3):
    mod = obj.modifiers.new('Aristas mecanizadas', 'BEVEL')
    mod.width = amount
    mod.segments = segments
    mod.affect = 'EDGES'
    mod = obj.modifiers.new('Normales ponderadas', 'WEIGHTED_NORMAL')
    mod.keep_sharp = True

def box(name, xyz, dims, mat, radius=.02, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz)
    obj = bpy.context.object
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    adopt(obj, name, mat, parent)
    if radius:
        bevel(obj, radius)
    return obj

def cylinder(name, xyz, radius, depth, mat, vertices=96, parent=None, rot=None, bevel_width=.008):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=xyz, rotation=rot or (0,0,0))
    obj = adopt(bpy.context.object, name, mat, parent)
    for p in obj.data.polygons:
        p.use_smooth = len(p.vertices) == 4
    if bevel_width:
        bevel(obj, bevel_width, 2)
    return obj

def torus(name, center, major, minor, mat, parent=None, segments=96):
    bpy.ops.mesh.primitive_torus_add(major_segments=segments, minor_segments=8, location=center, major_radius=major, minor_radius=minor)
    obj = adopt(bpy.context.object, name, mat, parent)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj

def rod(name, start, end, radius, mat, parent=None):
    a, b = Vector(start), Vector(end)
    obj = cylinder(name, (a+b)/2, radius, (b-a).length, mat, 32, parent, bevel_width=.004)
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = (b-a).to_track_quat('Z', 'Y')
    return obj

def text(name, words, location, size, mat, parent=None):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = words
    curve.size = size
    curve.extrude = .0004
    obj = bpy.data.objects.new(name, curve)
    model_collection.objects.link(obj)
    obj.location = location
    obj.data.materials.append(mat)
    if parent:
        world = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world
    model_objects.append(obj)
    return obj

# The coordinates intentionally match the old scene's disc and tonearm pivots.
for x in (-1.95,1.95):
    for y in (-1.46,1.46):
        cylinder('Pie de goma', (x,y,.105), .205,.19,rubber, 64)
        cylinder('Aro de pie', (x,y,.205), .16,.045,edge_dark, 64)
box('Chasis inferior', (0,0,.31), (5.0,3.95,.39), chassis, .13)
box('Filete del chasis', (0,0,.52), (4.97,3.92,.055), edge_dark, .025)
box('Plinto metálico', (0,0,.59), (4.94,3.89,.12), graphite, .07)
box('Borde frontal', (0,-1.92,.51), (4.75,.035,.052), edge, .012)
box('Panel frontal', (-.16,-1.69,.658), (3.9,.29,.014), chassis, .014)
text('Marca del aparato', 'JP / 01', (-2.0,-1.73,.67), .095, white)
text('Serie', 'STEREO TURNTABLE  /  PERSONAL SELECTION', (-1.25,-1.72,.67), .045, white)
text('Velocidades', '33    45', (.9,-1.72,.67), .052, white)

# The platter is empty: a textured mat and spindle remain when there is no LP.
px, py = -.50, 0
cylinder('Plato · faldón', (px,py,.73), 1.72,.14,edge_dark, 160, bevel_width=.025)
cylinder('Plato · anillo superior', (px,py,.805), 1.69,.045,edge, 160, bevel_width=.012)
cylinder('Alfombrilla de goma', (px,py,.837), 1.59,.038,mat_rubber, 160, bevel_width=.005)
torus('Borde del tapete', (px,py,.858), 1.555,.008,rubber, segments=160)
cylinder('Centro del tapete', (px,py,.859), .16,.008,rubber, 64, bevel_width=.002)
cylinder('Eje central', (px,py,.918), .036,.13,needle_metal, 48, bevel_width=.004)

# Fine marks around the rim are one mesh, keeping GPU draw calls bounded.
verts, faces = [], []
for row, count in enumerate((100, 100)):
    for i in range(count):
        a = 2*math.pi*(i + row*.5)/count
        rad = 1.706 if row == 0 else 1.66
        width = .014 if row == 0 else .010
        length = .025 if row == 0 else .018
        cx, cy = px+rad*math.cos(a), py+rad*math.sin(a)
        tangent = Vector((-math.sin(a), math.cos(a), 0)) * width/2
        radial = Vector((math.cos(a), math.sin(a), 0)) * length/2
        center = Vector((cx,cy,.829 if row == 0 else .83))
        base = len(verts)
        verts.extend([center-tangent-radial,center+tangent-radial,center+tangent+radial,center-tangent+radial])
        faces.append((base,base+1,base+2,base+3))
mesh_data = bpy.data.meshes.new('Indicadores estroboscópicos')
mesh_data.from_pydata(verts, [], faces)
marks = bpy.data.objects.new('Puntos estroboscópicos', mesh_data)
model_collection.objects.link(marks)
marks.data.materials.append(white)
model_objects.append(marks)

# Tonearm pivot is a named parent; the website animates this exact object.
arm_x, arm_y, arm_z = 1.45, 1.17, .81
cylinder('Base del brazo', (arm_x,arm_y,.726), .275,.12,black, 96)
cylinder('Anillo del brazo', (arm_x,arm_y,.805), .232,.065,edge, 96)
cylinder('Elevador del brazo', (arm_x,arm_y,.857), .17,.07,black, 80)
arm = bpy.data.objects.new('TONEARM_PIVOT', None)
model_collection.objects.link(arm)
arm.location = (arm_x,arm_y,arm_z)
bpy.context.view_layer.update()
model_objects.append(arm)
cylinder('Eje del brazo', (arm_x,arm_y,.94), .115,.12,edge, 64,arm)
rod('Tubo del brazo', (arm_x,arm_y+.36,1.02), (arm_x,arm_y-1.55,1.02), .047,needle_metal,arm)
rod('Codo del brazo', (arm_x,arm_y-1.55,1.02), (arm_x-.22,arm_y-1.95,.97), .047,needle_metal,arm)
cylinder('Contrapeso', (arm_x,arm_y+.46,1.02), .158,.32,black,64,arm,rot=(math.pi/2,0,0))
cylinder('Contrapeso · aro', (arm_x,arm_y+.30,1.02), .16,.024,edge,64,arm,rot=(math.pi/2,0,0))
box('Portacápsula', (arm_x-.24,arm_y-2.00,.95), (.28,.38,.09), black,.035,arm)
box('Cápsula', (arm_x-.24,arm_y-2.07,.89), (.17,.22,.10), chassis,.02,arm)
box('Punta de la cápsula', (arm_x-.24,arm_y-2.13,.83), (.09,.11,.04), red,.008,arm)
rod('Aguja', (arm_x-.24,arm_y-2.15,.82), (arm_x-.24,arm_y-2.18,.785), .009,needle_metal,arm)
rod('Palanca de elevación', (arm_x-.12,arm_y-1.65,1.02), (arm_x-.37,arm_y-1.77,1.01), .015,edge,arm)

# Controls, fasteners and printed scale make the device legible as a product.
for x in (-2.13,2.13):
    for y in (-1.58,1.58):
        cylinder('Tornillo', (x,y,.661), .034,.012,edge_dark,32,bevel_width=.002)
        box('Ranura del tornillo', (x,y,.668), (.034,.004,.002), black,.001)
cylinder('Interruptor · bisel', (-2.02,-1.30,.692), .12,.035,edge, 64)
cylinder('Interruptor', (-2.02,-1.30,.716), .095,.035,black, 64)
cylinder('Luz roja', (-2.02,-1.30,.738), .022,.009,red,32,bevel_width=.001)
box('Ranura selector', (1.95,-.22,.666), (.075,1.08,.012), black,.018)
box('Fader de velocidad', (1.95,-.45,.708), (.22,.18,.085), edge,.02)
for j in range(7):
    box('Marca de escala', (1.80,-.65+j*.14,.67), (.05,.008,.002), white,.001)
text('Marcado de escala', 'PITCH', (1.76,.54,.67), .05, white)
for x, name in ((1.37,'33'), (1.69,'45')):
    cylinder('Botón '+name, (x,-1.34,.687), .102,.045,edge_dark, 64)
    cylinder('Centro '+name, (x,-1.34,.713), .075,.012,black, 64,bevel_width=.002)
    text('Número '+name, name, (x-.045,-1.54,.669), .045, white)

# Keep the complete editable product and the studio in the Blender file.
studio = bpy.data.collections.new('ESTUDIO · LUCES Y CÁMARA')
bpy.context.scene.collection.children.link(studio)
def studio_obj(obj):
    for coll in list(obj.users_collection):
        coll.objects.unlink(obj)
    studio.objects.link(obj)
    return obj
def area(name, location, energy, size, target):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.shape = 'DISK'
    data.size = size
    obj = bpy.data.objects.new(name, data)
    studio.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
area('Luz principal amplia', (-4,-4,7), 950, 5, (0,0,0))
area('Luz de contorno', (4,3,5), 700, 4, (0,0,0))
area('Relleno suave', (2,-5,3), 250, 3, (0,0,.4))
bpy.ops.object.camera_add(location=(0,-8,8.5))
camera = studio_obj(bpy.context.object)
camera.name = 'Cámara · producto'
camera.rotation_euler = (Vector((0,0,.45))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 7.6
bpy.context.scene.camera = camera
bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 1000
bpy.context.scene.render.resolution_percentage = 100
world = bpy.context.scene.world
world.color = (.10,.10,.10)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

# Merge only the export copy, preserving both the arm pivot and the unmerged .blend.
groups = {}
for obj in model_objects:
    if obj.type != 'MESH' or not obj.data.materials:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    for modifier in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    key = (obj.parent.name if obj.parent else '', obj.data.materials[0].name)
    groups.setdefault(key, []).append(obj)
for objects in groups.values():
    if len(objects) < 2:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
model_objects = list(model_collection.objects)
bpy.ops.object.select_all(action='DESELECT')
for obj in model_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB', use_selection=True, export_apply=True, export_animations=False, export_yup=True)
print('MODEL_READY', glb_path, blend_path)
