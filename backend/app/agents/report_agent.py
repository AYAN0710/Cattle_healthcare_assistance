from datetime import datetime,timezone

def generate_health_report(
    disease:str,
    confidence:float,
    guidance:str,
    key_symptoms: list[str],
    precautions:list[str],
    veterinarian_advice: str
):
    report={
        'prediction':{
            'disease':disease,
            'confidence':confidence
        },
        'health_assessment':guidance,
        'key_symptoms':key_symptoms,
        'precautions':precautions,
        'recommended_actions':[
            "Monitor the animal for changes in symptoms.",
            "Follow the recommended precautions.",
            "Seek veterinary evaluation when required."
        ],
        'veterinarian_advice':veterinarian_advice,
        'generated_at':datetime.now(timezone.utc).isoformat()
    }
    return report