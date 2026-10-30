import math
import hashlib
from typing import Dict, Any, List, Tuple
from datetime import datetime

# 6-Factor Explainable Priority Calculator (Page 11 & 15 of Mini Project Report)
# Formula: Severity (30%) + Public Impact (20%) + Vulnerability (15%) + Corroboration (15%) + Persistence (10%) + Location (10%)
def calculate_priority_score(
    category: str,
    description: str,
    ward: str,
    address: str,
    confirmations_count: int = 1,
    avg_impact_rating: float = 4.0,
    created_at_dt: datetime = None
) -> Dict[str, Any]:
    desc_lower = (description or "").lower()
    addr_lower = (address or "").lower()
    ward_lower = (ward or "").lower()

    # 1. Severity (0 - 30)
    sev = 18.0
    if category in ['Pothole', 'Drainage']:
        sev = 24.0
        if any(w in desc_lower for w in ['large', 'deep', 'manhole', 'open', 'accident', 'danger', 'severe', 'swerving']):
            sev = 28.0
    elif category == 'Streetlight':
        sev = 19.0
        if any(w in desc_lower for w in ['junction', 'pitch dark', 'crime', 'corridor']):
            sev = 24.0
    elif category == 'Water Leakage':
        sev = 21.0
        if any(w in desc_lower for w in ['pipeline', 'burst', 'flooding', 'main line']):
            sev = 27.0
    elif category == 'Garbage':
        sev = 16.0
        if any(w in desc_lower for w in ['dump', 'overflowing', 'toxic', 'hospital']):
            sev = 22.0

    # 2. Public Impact (0 - 20)
    impact = 12.0
    if any(w in desc_lower or w in addr_lower for w in ['metro', 'pari chowk', 'junction', 'expressway', 'main road', 'commercial', 'transit', 'bus']):
        impact = 19.0
    elif any(w in desc_lower or w in addr_lower for w in ['knowledge park', 'college', 'student', 'market']):
        impact = 17.0

    # 3. Vulnerability (0 - 15)
    vuln = 8.0
    if any(w in desc_lower or w in addr_lower for w in ['school', 'college', 'hospital', 'gate', 'pedestrian', 'children', 'elderly', 'gcet']):
        vuln = 14.5
    elif 'knowledge park' in addr_lower:
        vuln = 13.0

    # 4. Corroboration (0 - 15)
    # Scaled by confirmations and impact rating
    corrob = min(15.0, (confirmations_count * 2.5) + (avg_impact_rating * 1.5))

    # 5. Persistence (0 - 10)
    persist = 5.0
    if created_at_dt:
        days_old = max(0, (datetime.now() - created_at_dt).days)
        persist = min(10.0, 4.0 + (days_old * 1.5))
    if any(w in desc_lower for w in ['days', 'weeks', 'month', 'recurring', 'unresolved']):
        persist = min(10.0, persist + 3.0)

    # 6. Location Context (0 - 10)
    loc_ctx = 6.0
    if any(w in addr_lower or w in ward_lower for w in ['pari chowk', 'knowledge park', 'expressway', 'institutional']):
        loc_ctx = 9.0

    total = round(sev + impact + vuln + corrob + persist + loc_ctx, 1)
    total = min(100.0, max(10.0, total))

    if total >= 80:
        level = 'CRITICAL' if total >= 90 else 'HIGH'
    elif total >= 55:
        level = 'MEDIUM'
    else:
        level = 'LOW'

    return {
        "severity": round(sev, 1),
        "publicImpact": round(impact, 1),
        "vulnerability": round(vuln, 1),
        "corroboration": round(corrob, 1),
        "persistence": round(persist, 1),
        "locationContext": round(loc_ctx, 1),
        "totalScore": total,
        "priorityLevel": level
    }

# Haversine distance in meters
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

# Real duplicate detection algorithm
def check_duplicate_candidates(
    new_lat: float,
    new_lng: float,
    new_category: str,
    new_desc: str,
    existing_incidents: List[Dict[str, Any]]
) -> Tuple[float, List[Dict[str, Any]], Optional[str]]:
    candidates = []
    max_prob = 0.0
    cluster_id = None

    new_words = set(new_desc.lower().split())

    for inc in existing_incidents:
        inc_loc = inc.get("location", {})
        lat = inc_loc.get("lat")
        lng = inc_loc.get("lng")
        if lat is None or lng is None:
            continue

        dist = haversine_distance(new_lat, new_lng, lat, lng)

        # Proximity threshold: 250 meters
        if dist <= 250:
            same_cat = (inc.get("category") == new_category)
            inc_words = set(inc.get("description", "").lower().split())
            overlap = len(new_words.intersection(inc_words)) / max(1, len(new_words))

            prob = 0.0
            if same_cat:
                if dist <= 50:
                    prob = 92.0 + (overlap * 7.0)
                elif dist <= 120:
                    prob = 80.0 + (overlap * 12.0)
                else:
                    prob = 60.0 + (overlap * 15.0)
            else:
                if dist <= 50:
                    prob = 40.0

            prob = min(99.0, round(prob, 1))

            if prob >= 50.0:
                if prob > max_prob:
                    max_prob = prob
                    cluster_id = inc.get("aiMetadata", {}).get("duplicateClusterId") or f"CLUSTER-{inc['id']}"

                candidates.append({
                    "id": inc["id"],
                    "reporterMasked": "Citizen (+91 98*** " + str(abs(hash(inc['id'])) % 9000 + 1000) + ")",
                    "distanceMeters": dist,
                    "reportedAgo": "Active nearby report",
                    "photoUrl": inc.get("evidence", {}).get("beforePhotoUrl", ""),
                    "description": inc.get("description", ""),
                    "timestamp": inc.get("createdAt", ""),
                    "provenance": inc.get("evidence", {}).get("provenance", "live_camera")
                })

    return max_prob, candidates, cluster_id

# Department routing engine
def suggest_department(category: str) -> str:
    mapping = {
        "Pothole": "Roads & Public Works Department",
        "Streetlight": "Electrical & Street Lighting Department",
        "Garbage": "Sanitation & Solid Waste Management",
        "Water Leakage": "Water Supply & Sewage Department",
        "Drainage": "Drainage & Sewerage Department",
        "Open Manhole": "Drainage & Sewerage Department",
        "Footpath": "Roads & Public Works Department",
        "Public Asset": "Civil Assets & Infrastructure Maintenance",
        "Traffic Sign": "Traffic & Public Safety Infrastructure",
        "Other": "General Municipal Administration"
    }
    return mapping.get(category, "General Municipal Administration")

# Media hash check
def compute_media_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

