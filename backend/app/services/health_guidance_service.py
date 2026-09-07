def generate_health_guidance(disease:str,confidence:float,question:str|None=None):
    guidance=(
        f'The CNN predicted {disease} with '
        f'{confidence:.2%} confidence.'
    )
    precautions=[
        "Isolate the affected animal from other livestock.",
        "Monitor the animal closely for changes in symptoms.",
        "Consult a qualified veterinarian for proper diagnosis "
        "and treatment."
    ]
    veterinarian_advice=(
        "Veterinary evaluation is recommended before starting "
        "any treatment or medication."
    )
    return {
        "disease": disease,
        "confidence": confidence,
        "guidance": guidance,
        "precautions": precautions,
        "veterinarian_advice": veterinarian_advice
    }