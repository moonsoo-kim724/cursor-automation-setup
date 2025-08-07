'use client'

import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'medicalOrganization' | 'faq' | 'breadcrumb' | 'localBusiness'
  data?: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalOrganization',
          name: '연수김안과의원',
          alternateName: 'Yeonsu Kim Eye Clinic',
          description: '인천 송도 소재 30년 전문 경력의 안과 수술 전문 병원. AI 기반 디지털 헬스케어 서비스 제공.',
          url: 'https://ysk-eye.clinic',
          logo: 'https://ysk-eye.clinic/logo.png',
          image: 'https://ysk-eye.clinic/og-image.jpg',
          telephone: '+82-32-1544-7260',
          email: 'info@ysk-eye.clinic',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '인천광역시 연수구 송도과학로 32',
            addressLocality: '연수구',
            addressRegion: '인천광역시',
            postalCode: '21984',
            addressCountry: 'KR'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 37.3894,
            longitude: 126.6413
          },
          openingHours: [
            'Mo-Fr 09:00-18:00',
            'Sa 09:00-13:00'
          ],
          speciality: [
            '시력교정술',
            'LASIK',
            'LASEK',
            '백내장 수술',
            '노안 교정',
            '망막 질환',
            '녹내장'
          ],
          medicalSpecialty: 'Ophthalmology',
          founder: {
            '@type': 'Person',
            name: '김연수',
            jobTitle: '원장',
            description: '30년 경력의 안과 전문의'
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: '안과 진료 서비스',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'MedicalProcedure',
                  name: '라식 수술',
                  description: '최첨단 레이저를 이용한 시력교정술'
                }
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'MedicalProcedure',
                  name: '백내장 수술',
                  description: '노화로 인한 백내장 치료'
                }
              }
            ]
          },
          sameAs: [
            'https://www.facebook.com/yskeyeclinic',
            'https://www.instagram.com/ysk_eye_clinic',
            'https://blog.naver.com/yskeyeclinic'
          ]
        }

      case 'faq':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data?.faqs?.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          })) || []
        }

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data?.breadcrumbs?.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
          })) || []
        }

      case 'localBusiness':
        return {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': 'https://ysk-eye.clinic',
          name: '연수김안과의원',
          image: 'https://ysk-eye.clinic/og-image.jpg',
          telephone: '+82-32-1544-7260',
          url: 'https://ysk-eye.clinic',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '인천광역시 연수구 송도과학로 32',
            addressLocality: '연수구',
            addressRegion: '인천광역시',
            postalCode: '21984',
            addressCountry: 'KR'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 37.3894,
            longitude: 126.6413
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '09:00',
              closes: '18:00'
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Saturday',
              opens: '09:00',
              closes: '13:00'
            }
          ],
          priceRange: '$$',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '247'
          }
        }

      default:
        return {}
    }
  }

  const structuredData = getStructuredData()

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}
