import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { injectClass } from 'angular-unit-test-helper'

import { TimezoneService } from './timezone.service'

describe('TimezoneService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
  })

  it('should be created', () => {
    const service = injectClass(TimezoneService)
    expect(service).toBeTruthy()
  })
})
