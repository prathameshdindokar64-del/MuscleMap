/**
 * Muscle map for each body region.
 * Maps region IDs to their associated muscle groups.
 * Used by the pain analyzer to identify affected muscles.
 * EXTENSIBILITY: Add new regions or refine muscle lists as the knowledge base grows.
 */

export const REGION_MUSCLES: Record<string, string[]> = {
  neck:            ['Sternocleidomastoid', 'Trapezius (Upper)', 'Levator Scapulae', 'Scalenes'],
  left_shoulder:   ['Anterior Deltoid', 'Lateral Deltoid', 'Posterior Deltoid', 'Rotator Cuff', 'Trapezius'],
  right_shoulder:  ['Anterior Deltoid', 'Lateral Deltoid', 'Posterior Deltoid', 'Rotator Cuff', 'Trapezius'],
  chest:           ['Pectoralis Major', 'Pectoralis Minor', 'Serratus Anterior', 'Intercostals'],
  upper_back:      ['Trapezius (Middle/Lower)', 'Rhomboids', 'Latissimus Dorsi', 'Erector Spinae (Upper)'],
  lower_back:      ['Erector Spinae', 'Quadratus Lumborum', 'Multifidus', 'Gluteus Maximus'],
  abdomen:         ['Rectus Abdominis', 'External Oblique', 'Internal Oblique', 'Transverse Abdominis'],
  left_hip:        ['Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus', 'Piriformis', 'TFL'],
  right_hip:       ['Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus', 'Piriformis', 'TFL'],
  left_thigh:      ['Quadriceps', 'Hamstrings', 'Adductors', 'Rectus Femoris', 'IT Band'],
  right_thigh:     ['Quadriceps', 'Hamstrings', 'Adductors', 'Rectus Femoris', 'IT Band'],
  left_knee:       ['Patellar Tendon', 'IT Band', 'Popliteus', 'Medial Meniscus'],
  right_knee:      ['Patellar Tendon', 'IT Band', 'Popliteus', 'Medial Meniscus'],
  left_calf:       ['Gastrocnemius', 'Soleus', 'Tibialis Anterior', 'Peroneus Longus'],
  right_calf:      ['Gastrocnemius', 'Soleus', 'Tibialis Anterior', 'Peroneus Longus'],
  left_ankle:      ['Achilles Tendon', 'Peroneus Longus', 'Tibialis Anterior', 'Plantar Fascia'],
  right_ankle:     ['Achilles Tendon', 'Peroneus Longus', 'Tibialis Anterior', 'Plantar Fascia'],
  left_wrist:      ['Flexor Carpi Radialis', 'Extensor Carpi', 'Pronator Teres'],
  right_wrist:     ['Flexor Carpi Radialis', 'Extensor Carpi', 'Pronator Teres'],
};

/** Human-readable names for each region */
export const REGION_NAMES: Record<string, string> = {
  neck:            'Neck',
  left_shoulder:   'Left Shoulder',
  right_shoulder:  'Right Shoulder',
  chest:           'Chest',
  upper_back:      'Upper Back',
  lower_back:      'Lower Back',
  abdomen:         'Abdomen',
  left_hip:        'Left Hip',
  right_hip:       'Right Hip',
  left_thigh:      'Left Thigh',
  right_thigh:     'Right Thigh',
  left_knee:       'Left Knee',
  right_knee:      'Right Knee',
  left_calf:       'Left Calf',
  right_calf:      'Right Calf',
  left_ankle:      'Left Ankle',
  right_ankle:     'Right Ankle',
  left_wrist:      'Left Wrist',
  right_wrist:     'Right Wrist',
};
