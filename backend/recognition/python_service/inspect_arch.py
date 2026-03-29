import tensorflow as tf
m = tf.keras.models.load_model('app/model.keras')
print("Total layers:", len(m.layers))
for i, l in enumerate(m.layers):
    cfg = l.get_config()
    print(f"L{i} {l.__class__.__name__}: units={cfg.get('units')} act={cfg.get('activation')} rate={cfg.get('rate')}")
