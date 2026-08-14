# Compact semantic planning

<!-- prompt:start -->
Planla. Yalnızca ürün semantiğini ve ekran görevlerini çıkar; stil, component tree,
token, örnek içerik, kalite açıklaması veya sunum üretme.

JSON döndür:
{"productDomain":"","audience":"","entities":[],"capabilities":[],"contentVocabulary":[],"screens":[{"id":"","name":"","route":"","role":"overview|core|detail|form|support|settings|onboarding","archetype":"dashboard|management_list|settings|form|detail|profile","purpose":"","primaryAction":"","navigationTargetIds":[]}],"navigation":{"primaryScreenIds":[],"utilityScreenIds":[]}}

Kurallar: 3-8 ekran; ilk ekran overview. Her ekran briefteki ayrı bir kullanıcı
görevini çözsün. id ve route kısa kebab-case olsun. entities somut varlıklar,
capabilities kullanıcı eylemleri, primaryAction tek kısa eylem anahtarıdır.
navigation yalnızca screens içindeki id değerlerini kullansın. Ekranları tekrar
etme, stil veya component ayrıntısı ekleme. Sadece geçerli JSON döndür.

KULLANICI BRIEFİ:
<!-- prompt:end -->
