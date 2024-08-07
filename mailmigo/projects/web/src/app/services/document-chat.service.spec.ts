import { TestBed } from '@angular/core/testing';

import { DocumentChatService } from './document-chat.service';

describe('DocumentChatService', () => {
  let service: DocumentChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
