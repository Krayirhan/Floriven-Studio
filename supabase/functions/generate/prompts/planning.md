# Compact semantic planning

<!-- prompt:start -->
Planla. Yalnızca ürün semantiğini ve ekran görevlerini çıkar; stil, component tree,
token, örnek içerik, kalite açıklaması veya sunum üretme.

JSON döndür:
{"productDomain":"","audience":"","entities":[],"capabilities":[],"contentVocabulary":[],"screens":[{"id":"","name":"","route":"","role":"overview|core|detail|form|support|settings|onboarding","archetype":"dashboard|management_list|settings|form|detail|profile|analytics","experiencePattern":"standard|calendar|timeline|gallery|board|map","purpose":"","sections":[],"contract":{"job":"","requiredSections":[],"sectionRoles":[{"section":"","role":"summary|filters|entity-list|form-fields|actions|analytics|details|settings"}],"identityIntent":{"dominantRole":"summary|filters|entity-list|form-fields|actions|analytics|details|settings","supportingRole":"summary|filters|entity-list|form-fields|actions|analytics|details|settings","densityProfile":"focused|balanced|dense"},"primaryAction":"","secondaryActions":[],"requiredData":[],"navigationTargetIds":[]}}],"navigation":{"primaryScreenIds":[],"utilityScreenIds":[]}}

Kurallar: 3-8 ekran; ilk ekran overview. Her ekran briefteki ayrı bir kullanıcı
görevini çözsün. id ve route kısa kebab-case olsun. entities somut varlıklar,
capabilities kullanıcı eylemleridir. Her screen.contract zorunludur: job purpose ile
birebir aynı; requiredSections screens.sections içinden en az 2 bölüm; primaryAction
tek somut eylem; requiredData görünür olması gereken en az 2 veri alanı;
navigationTargetIds yalnız başka screen id değerleri olmalıdır.
Her section için aynı adlı tek bir sectionRoles kaydı üret; ekran en az iki farklı rol
kullansın ve rol archetype ile uyumlu olsun. navigation yalnızca
screens içindeki id değerlerini kullansın. Ekranları tekrar
etme, stil veya component ayrıntısı ekleme. Sadece geçerli JSON döndür.

KULLANICI BRIEFİ:
Her identityIntent zorunludur. dominantRole ve supportingRole sectionRoles içinde bulunan
iki farklı rol olmalıdır. Aynı archetype ekranlarda dominantRole + supportingRole +
densityProfile üçlüsü benzersiz olmalı ve ekranın veri sorumluluğunu yansıtmalıdır.
experiencePattern ekranın ayırt edici etkileşim modelidir. Takvim/randevu/saat planlama
ekranlarında calendar; geçmiş/aktivite akışında timeline; portfolyo/görsel koleksiyonda
gallery; kanban/kolon-kart iş akışında board; konum/rota deneyiminde map zorunludur.
Bu ekranları dashboard veya liste bileşenleriyle taklit etme. Diğer ekranlarda standard kullan.
<!-- prompt:end -->
