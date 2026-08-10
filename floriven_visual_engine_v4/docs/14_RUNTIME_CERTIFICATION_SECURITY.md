# 14 — Runtime Certification & Security

## Amaç

Runtime evidence runner'ın historical job token'a ihtiyaç duymadan, read-only ve kısa ömürlü biçimde
candidate okuyabilmesini sağlamak.

## Endpoint

```http
POST /runtime-certification/session
```

## Token

`RuntimeCertificationToken`:

- server-signed
- job-bound
- candidate-hash-bound
- read-only
- short TTL
- generation/mutation yetkisi yok

Önerilen TTL:

```text
10 dakika
```

## Generate read path

GET job/candidate endpoint'i aşağıdakilerden birini kabul eder:

- normal `X-Job-Token`
- valid `X-Runtime-Certification-Token`

Normal auth contract değişmez.

## Security tests

- wrong job
- wrong candidate hash
- expired
- malformed
- signature mutation
- read other job
- write attempt
- generation attempt
- replay after expiry
- normal X-Job-Token regression

## Evidence runner

Token yalnız certification flow sırasında oluşturulur.

No browser-local long-lived secret.
