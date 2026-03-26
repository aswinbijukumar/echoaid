from sklearn.preprocessing import LabelEncoder
import string

labels = list(string.ascii_uppercase) + ['1','2','3','4','5','6','7','8','9']
enc = LabelEncoder()
encoded = enc.fit_transform(labels)
mapping = dict(zip(enc.classes_, range(len(enc.classes_))))
print("Mapping (sorted unique values):")
print(mapping)

alphabet_expected = [label for label, idx in sorted(mapping.items(), key=lambda item: item[1])]
print("\nAlphabet list for main.py should be:")
print(alphabet_expected)
