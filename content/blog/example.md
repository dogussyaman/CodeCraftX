# Örnek Blog Yazısı (Markdown)

Bu dosya, blog sisteminde desteklenen **Markdown** öğelerini gösterir.

## Başlıklar

İkinci seviye başlık (`h2`) ve altındaki başlıklar içerikte kullanılır. Sayfa başlığı tek `h1` olarak sayfa düzeyinde kalmalıdır.

### Üçüncü seviye (h3)

#### Dördüncü (h4)

##### Beşinci (h5)

###### Altıncı (h6)

## Paragraflar ve metin

Normal paragraf. *İtalik* ve **kalın** metin desteklenir. Satır sonları tek boşlukla korunur.

İkinci paragraf. `inline code` da kullanılabilir.

## Listeler

Sırasız liste:

- Birinci madde
- İkinci madde
- Üçüncü madde

Sıralı liste:

1. İlk adım
2. İkinci adım
3. Üçüncü adım

## Alıntı (blockquote)

> Yazılım geliştirme, sürekli öğrenmeyi gerektirir. Bu alıntı, blockquote bileşeni ile gösteriliyor.

## Kod bloğu

Aşağıda sözdizimi vurgulu bir kod örneği:

```typescript
function greet(name: string): string {
  return `Merhaba, ${name}!`
}

const message = greet("CodeCraftX")
console.log(message)
```

## Görsel

Markdown içinde görsel eklemek için:

![Açıklama metni](/placeholder.svg)

---

Bu örnek, `MdxRenderer` ile render edildiğinde tüm bu öğelerin doğru görüntülendiğini doğrulamak için kullanılabilir.
