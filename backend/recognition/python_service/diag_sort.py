import string
from sklearn.preprocessing import LabelEncoder

alphabet = list(string.ascii_uppercase) + ['1', '2', '3', '4', '5', '6', '7', '8', '9']
enc = LabelEncoder()
y = enc.fit_transform(alphabet)

print("Classes count:", len(enc.classes_))
for i, cls in enumerate(enc.classes_):
    print(f"{i}: {cls}")
