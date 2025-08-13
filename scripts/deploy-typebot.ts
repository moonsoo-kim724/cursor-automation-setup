/**
 * YSK 연수김안과의원 - Typebot 시나리오 배포 스크립트
 * Vooster T-027 태스크 구현
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

interface TypebotScenario {
  id: string
  name: string
  version: string
  groups: any[]
  variables: any[]
  edges: any[]
  theme: any
  settings: any
}

interface DeployResult {
  success: boolean
  typebotId?: string
  message?: string
  error?: string
}

class TypebotDeployer {
  private apiToken: string
  private typebotId: string
  private baseUrl: string

  constructor() {
    this.apiToken = process.env.TYPEBOT_API_TOKEN || ''
    this.typebotId = process.env.TYPEBOT_ID || ''
    this.baseUrl = 'https://app.typebot.io/api'

    if (!this.apiToken || !this.typebotId) {
      throw new Error('TYPEBOT_API_TOKEN과 TYPEBOT_ID가 .env.local에 설정되어야 합니다.')
    }
  }

  /**
   * JSON 파일 로드
   */
  private loadScenarioJson(filePath: string): TypebotScenario {
    try {
      const fullPath = path.resolve(filePath)
      const jsonData = fs.readFileSync(fullPath, 'utf-8')
      const scenario = JSON.parse(jsonData) as TypebotScenario
      
      console.log(`📄 시나리오 로드 완료: ${scenario.name}`)
      return scenario
    } catch (error: any) {
      throw new Error(`JSON 파일 로드 실패: ${error.message}`)
    }
  }

  /**
   * 웹훅 URL 동적 설정
   */
  private updateWebhookUrls(scenario: TypebotScenario): TypebotScenario {
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const scenarioStr = JSON.stringify(scenario)
    const updatedStr = scenarioStr.replace(/\{\{WEBHOOK_URL\}\}/g, webhookUrl)
    
    console.log(`🔗 웹훅 URL 설정: ${webhookUrl}`)
    return JSON.parse(updatedStr)
  }

  /**
   * Typebot 생성 또는 업데이트
   */
  async deployScenario(scenarioPath: string): Promise<DeployResult> {
    try {
      // 1. JSON 시나리오 로드
      let scenario = this.loadScenarioJson(scenarioPath)
      
      // 2. 웹훅 URL 동적 설정
      scenario = this.updateWebhookUrls(scenario)

      // 3. 기존 Typebot 확인
      const existingTypebot = await this.getTypebot()
      
      if (existingTypebot) {
        // 4a. 기존 Typebot 업데이트
        console.log('🔄 기존 Typebot 업데이트 중...')
        const updateResult = await this.updateTypebot(scenario)
        return updateResult
      } else {
        // 4b. 새 Typebot 생성 
        console.log('🆕 새 Typebot 생성 중...')
        const createResult = await this.createTypebot(scenario)
        return createResult
      }
    } catch (error: any) {
      console.error('❌ 배포 실패:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 기존 Typebot 조회
   */
  private async getTypebot(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/typebots/${this.typebotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 404) {
        return null // Typebot이 존재하지 않음
      }

      if (!response.ok) {
        throw new Error(`Typebot 조회 실패: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.warn(`⚠️ Typebot 조회 중 오류: ${error.message}`)
      return null
    }
  }

  /**
   * 새 Typebot 생성
   */
  private async createTypebot(scenario: TypebotScenario): Promise<DeployResult> {
    try {
      const response = await fetch(`${this.baseUrl}/typebots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...scenario,
          id: this.typebotId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Typebot 생성 실패: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Typebot 생성 성공!')
      
      return {
        success: true,
        typebotId: result.id,
        message: 'Typebot이 성공적으로 생성되었습니다.'
      }
    } catch (error: any) {
      throw new Error(`Typebot 생성 중 오류: ${error.message}`)
    }
  }

  /**
   * 기존 Typebot 업데이트
   */
  private async updateTypebot(scenario: TypebotScenario): Promise<DeployResult> {
    try {
      const response = await fetch(`${this.baseUrl}/typebots/${this.typebotId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Typebot 업데이트 실패: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Typebot 업데이트 성공!')
      
      return {
        success: true,
        typebotId: result.id,
        message: 'Typebot이 성공적으로 업데이트되었습니다.'
      }
    } catch (error: any) {
      throw new Error(`Typebot 업데이트 중 오류: ${error.message}`)
    }
  }

  /**
   * Typebot 퍼블리시 (공개)
   */
  async publishTypebot(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/typebots/${this.typebotId}/publish`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Typebot 퍼블리시 실패: ${response.status} ${errorText}`)
        return false
      }

      console.log('🚀 Typebot 퍼블리시 성공!')
      return true
    } catch (error: any) {
      console.error(`❌ Typebot 퍼블리시 중 오류: ${error.message}`)
      return false
    }
  }

  /**
   * 배포 버전 정보 저장
   */
  private async saveDeploymentVersion(scenario: TypebotScenario): Promise<void> {
    try {
      const versionInfo = {
        typebotId: this.typebotId,
        scenarioName: scenario.name,
        version: scenario.version,
        deployedAt: new Date().toISOString(),
        groups: scenario.groups.length,
        variables: scenario.variables.length
      }

      const versionPath = path.resolve('typebot-scenarios', 'deployment-history.json')
      let history: any[] = []
      
      // 기존 히스토리 로드
      if (fs.existsSync(versionPath)) {
        const historyData = fs.readFileSync(versionPath, 'utf-8')
        history = JSON.parse(historyData)
      }
      
      // 새 배포 정보 추가
      history.unshift(versionInfo)
      
      // 최근 10개 배포만 유지
      if (history.length > 10) {
        history = history.slice(0, 10)
      }
      
      // 파일 저장
      fs.writeFileSync(versionPath, JSON.stringify(history, null, 2))
      console.log('💾 배포 버전 정보 저장 완료')
    } catch (error: any) {
      console.warn(`⚠️ 버전 정보 저장 실패: ${error.message}`)
    }
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 YSK 연수김안과의원 Typebot 배포 시작...')
  
  try {
    const deployer = new TypebotDeployer()
    const scenarioPath = 'typebot-scenarios/ysk-eye-clinic-funnel.json'
    
    // 1. 시나리오 배포
    const result = await deployer.deployScenario(scenarioPath)
    
    if (!result.success) {
      console.error(`❌ 배포 실패: ${result.error}`)
      process.exit(1)
    }
    
    console.log(`✅ ${result.message}`)
    
    // 2. Typebot 퍼블리시
    const publishSuccess = await deployer.publishTypebot()
    
    if (!publishSuccess) {
      console.warn('⚠️ 퍼블리시에 실패했지만 배포는 완료되었습니다.')
    }
    
    console.log('🎉 Typebot 배포가 완료되었습니다!')
    console.log(`🔗 Typebot URL: https://app.typebot.io/typebots/${process.env.TYPEBOT_ID}`)
    
  } catch (error: any) {
    console.error('💥 치명적 오류:', error.message)
    process.exit(1)
  }
}

// 스크립트 직접 실행 시에만 main 함수 실행
if (require.main === module) {
  main()
}

export { TypebotDeployer }