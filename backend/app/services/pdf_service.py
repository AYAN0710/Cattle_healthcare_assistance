from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    ListFlowable,
    ListItem
)


def generate_health_report_pdf(report_document: dict):

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = styles["BodyText"]

    story = []

    report = report_document["report"]

    prediction = report["prediction"]

    # Title
    story.append(
        Paragraph(
            "BoviCare Automated Health Report",
            title_style
        )
    )

    # Prediction information
    prediction_data = [
        ["Disease", prediction["disease"]],
        [
            "Confidence",
            f"{prediction['confidence'] * 100:.2f}%"
        ],
        [
            "Generated At",
            report["generated_at"]
        ]
    ]

    table = Table(
        prediction_data,
        colWidths=[45 * mm, 125 * mm]
    )

    table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, "black"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])
    )

    story.append(table)

    # Health Assessment
    story.append(
        Paragraph(
            "Health Assessment",
            heading_style
        )
    )

    story.append(
        Paragraph(
            report["health_assessment"],
            body_style
        )
    )

    # Symptoms
    story.append(
        Paragraph(
            "Key Symptoms",
            heading_style
        )
    )

    symptoms = report.get("key_symptoms", [])

    if symptoms:
        story.append(
            ListFlowable(
                [
                    ListItem(
                        Paragraph(symptom, body_style)
                    )
                    for symptom in symptoms
                ],
                bulletType="bullet"
            )
        )
    else:
        story.append(
            Paragraph(
                "No disease-specific symptoms were available "
                "from the retrieved information.",
                body_style
            )
        )

    # Precautions
    story.append(
        Paragraph(
            "Precautions",
            heading_style
        )
    )

    precautions = report.get("precautions", [])

    if isinstance(precautions, str):
        precautions = [precautions]

    if precautions:
        story.append(
            ListFlowable(
                [
                    ListItem(
                        Paragraph(item, body_style)
                    )
                    for item in precautions
                ],
                bulletType="bullet"
            )
        )

    # Recommended Actions
    story.append(
        Paragraph(
            "Recommended Actions",
            heading_style
        )
    )

    actions = report.get("recommended_actions", [])

    story.append(
        ListFlowable(
            [
                ListItem(
                    Paragraph(item, body_style)
                )
                for item in actions
            ],
            bulletType="bullet"
        )
    )

    # Veterinary Advice
    story.append(
        Paragraph(
            "Veterinarian Advice",
            heading_style
        )
    )

    story.append(
        Paragraph(
            report["veterinarian_advice"],
            body_style
        )
    )

    # Disclaimer
    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> This report is generated using "
            "AI-assisted livestock health information and should "
            "not replace professional veterinary diagnosis or "
            "treatment.",
            body_style
        )
    )

    doc.build(story)

    buffer.seek(0)

    return buffer