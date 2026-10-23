1	// 손님(내방) 관리 JavaScript
     2	
     3	Auth.requireAuth();
     4	
     5	// 관리자인 경우 설정 메뉴 표시
     6	if (Auth.isAdmin()) {
     7	    const settingsNav = document.getElementById('settingsNav');
     8	    if (settingsNav) settingsNav.style.display = 'flex';
     9	}
    10	
    11	// 사용자 정보 표시
    12	const user = Auth.getCurrentUser();
    13	if (user) {
    14	    const userInitial = document.getElementById('userInitial');
    15	    if (userInitial) userInitial.textContent = user.name.charAt(0);
    16	}
    17	
    18	// 전역 변수
    19	let allCustomers = [];
    20	let currentEditId = null;
    21	
    22	// 페이지 로드 시 데이터 불러오기
    23	document.addEventListener('DOMContentLoaded', () => {
    24	    loadCustomers();
    25	    setupEventListeners();
    26	    
    27	    // 오늘 날짜를 기본값으로 설정
    28	    document.getElementById('visitDate').valueAsDate = new Date();
    29	});
    30	
    31	// 이벤트 리스너 설정
    32	function setupEventListeners() {
    33	    const searchInput = document.getElementById('searchInput');
    34	    const statusFilter = document.getElementById('statusFilter');
    35	    const dateFilter = document.getElementById('dateFilter');
    36	    
    37	    searchInput.addEventListener('input', filterCustomers);
    38	    statusFilter.addEventListener('change', filterCustomers);
    39	    dateFilter.addEventListener('change', filterCustomers);
    40	}
    41	
    42	// 손님 목록 불러오기
    43	async function loadCustomers() {
    44	    try {
    45	        const response = await API.get('customers', { limit: 1000, sort: '-created_at' });
    46	        allCustomers = response.data || [];
    47	        renderCustomers(allCustomers);
    48	    } catch (error) {
    49	        console.error('Load customers error:', error);
    50	        Toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    51	        document.getElementById('customerTableBody').innerHTML = `
    52	            <tr>
    53	                <td colspan="6" style="text-align: center; padding: 40px; color: var(--error-color);">
    54	                    데이터를 불러올 수 없습니다.
    55	                </td>
    56	            </tr>
    57	        `;
    58	    }
    59	}
    60	
    61	// 손님 목록 렌더링
    62	function renderCustomers(customers) {
    63	    const tbody = document.getElementById('customerTableBody');
    64	    
    65	    if (!customers || customers.length === 0) {
    66	        tbody.innerHTML = `
    67	            <tr>
    68	                <td colspan="6" style="text-align: center; padding: 40px;">
    69	                    <div class="empty-state">
    70	                        <div class="empty-state-icon">👥</div>
    71	                        <div class="empty-state-text">등록된 손님이 없습니다</div>
    72	                        <button class="btn btn-primary" onclick="openAddModal()" style="margin-top: 16px;">
    73	                            손님 등록하기
    74	                        </button>
    75	                    </div>
    76	                </td>
    77	            </tr>
    78	        `;
    79	        return;
    80	    }
    81	    
    82	    tbody.innerHTML = customers.map(customer => `
    83	        <tr>
    84	            <td>${formatDate(customer.visit_date)}</td>
    85	            <td>${customer.looking_for || '-'}</td>
    86	            <td>${customer.contact || '-'}</td>
    87	            <td>${customer.special_notes || '-'}</td>
    88	            <td>${getStatusBadge(customer.status || '대기')}</td>
    89	            <td>
    90	                <button class="btn btn-sm" onclick="viewDetail('${customer.id}')" style="margin-right: 4px;">
    91	                    <i class="fas fa-eye"></i>
    92	                </button>
    93	                <button class="btn btn-sm" onclick="editCustomer('${customer.id}')" style="margin-right: 4px;">
    94	                    <i class="fas fa-edit"></i>
    95	                </button>
    96	                <button class="btn btn-sm" onclick="deleteCustomer('${customer.id}')" style="background: var(--error-color); color: white;">
    97	                    <i class="fas fa-trash"></i>
    98	                </button>
    99	            </td>
   100	        </tr>
   101	    `).join('');
   102	}
   103	
   104	// 필터링
   105	function filterCustomers() {
   106	    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
   107	    const statusFilter = document.getElementById('statusFilter').value;
   108	    const dateFilter = document.getElementById('dateFilter').value;
   109	    
   110	    let filtered = allCustomers;
   111	    
   112	    // 검색어 필터
   113	    if (searchTerm) {
   114	        filtered = filtered.filter(c => 
   115	            (c.looking_for || '').toLowerCase().includes(searchTerm) ||
   116	            (c.contact || '').toLowerCase().includes(searchTerm) ||
   117	            (c.special_notes || '').toLowerCase().includes(searchTerm)
   118	        );
   119	    }
   120	    
   121	    // 상태 필터
   122	    if (statusFilter) {
   123	        filtered = filtered.filter(c => c.status === statusFilter);
   124	    }
   125	    
   126	    // 날짜 필터
   127	    if (dateFilter) {
   128	        filtered = filtered.filter(c => {
   129	            const visitDate = c.visit_date ? c.visit_date.split('T')[0] : '';
   130	            return visitDate === dateFilter;
   131	        });
   132	    }
   133	    
   134	    renderCustomers(filtered);
   135	}
   136	
   137	// 등록 모달 열기
   138	function openAddModal() {
   139	    currentEditId = null;
   140	    
   141	    document.getElementById('modalTitle').textContent = '손님 등록';
   142	    document.getElementById('customerForm').reset();
   143	    document.getElementById('customerId').value = '';
   144	    document.getElementById('visitDate').valueAsDate = new Date();
   145	    document.getElementById('status').value = '대기';
   146	    
   147	    Modal.open('customerModal');
   148	}
   149	
   150	// 수정 모달 열기
   151	async function editCustomer(id) {
   152	    try {
   153	        const customer = allCustomers.find(c => c.id === id);
   154	        if (!customer) throw new Error('Customer not found');
   155	        
   156	        currentEditId = id;
   157	        
   158	        document.getElementById('modalTitle').textContent = '손님 정보 수정';
   159	        document.getElementById('customerId').value = id;
   160	        document.getElementById('visitDate').value = customer.visit_date ? customer.visit_date.split('T')[0] : '';
   161	        document.getElementById('lookingFor').value = customer.looking_for || '';
   162	        document.getElementById('contact').value = customer.contact || '';
   163	        document.getElementById('specialNotes').value = customer.special_notes || '';
   164	        document.getElementById('status').value = customer.status || '대기';
   165	        document.getElementById('memo').value = customer.memo || '';
   166	        
   167	        Modal.open('customerModal');
   168	    } catch (error) {
   169	        console.error('Edit customer error:', error);
   170	        Toast.error('손님 정보를 불러오는 중 오류가 발생했습니다.');
   171	    }
   172	}
   173	
   174	// 저장
   175	async function saveCustomer() {
   176	    const form = document.getElementById('customerForm');
   177	    if (!form.checkValidity()) {
   178	        form.reportValidity();
   179	        return;
   180	    }
   181	    
   182	    const customerData = {
   183	        visit_date: new Date(document.getElementById('visitDate').value).toISOString(),
   184	        looking_for: document.getElementById('lookingFor').value,
   185	        contact: document.getElementById('contact').value,
   186	        special_notes: document.getElementById('specialNotes').value,
   187	        status: document.getElementById('status').value,
   188	        memo: document.getElementById('memo').value,
   189	        created_by: user.id
   190	    };
   191	    
   192	    try {
   193	        if (currentEditId) {
   194	            // 수정
   195	            await API.put(`customers/${currentEditId}`, customerData);
   196	            Toast.success('손님 정보가 수정되었습니다.');
   197	        } else {
   198	            // 등록
   199	            await API.post('customers', customerData);
   200	            Toast.success('새 손님이 등록되었습니다.');
   201	        }
   202	        
   203	        closeModal();
   204	        loadCustomers();
   205	    } catch (error) {
   206	        console.error('Save customer error:', error);
   207	        Toast.error('저장 중 오류가 발생했습니다.');
   208	    }
   209	}
   210	
   211	// 삭제
   212	async function deleteCustomer(id) {
   213	    if (!confirm('정말 삭제하시겠습니까?')) return;
   214	    
   215	    try {
   216	        await API.delete(`customers/${id}`);
   217	        Toast.success('손님 정보가 삭제되었습니다.');
   218	        loadCustomers();
   219	    } catch (error) {
   220	        console.error('Delete customer error:', error);
   221	        Toast.error('삭제 중 오류가 발생했습니다.');
   222	    }
   223	}
   224	
   225	// 상세보기
   226	function viewDetail(id) {
   227	    const customer = allCustomers.find(c => c.id === id);
   228	    if (!customer) return;
   229	    
   230	    const detailContent = document.getElementById('detailContent');
   231	    detailContent.innerHTML = `
   232	        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
   233	            <div>
   234	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">기본 정보</h3>
   235	                <p><strong>방문(내전)일자:</strong> ${formatDate(customer.visit_date)}</p>
   236	                <p><strong>찾는물건(업종):</strong> ${customer.looking_for || '-'}</p>
   237	                <p><strong>연락처:</strong> ${customer.contact || '-'}</p>
   238	                <p><strong>특이사항:</strong> ${customer.special_notes || '-'}</p>
   239	                <p><strong>상태:</strong> ${getStatusBadge(customer.status || '대기')}</p>
   240	            </div>
   241	            <div>
   242	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">관리 정보</h3>
   243	                <p><strong>등록일:</strong> ${formatDate(customer.created_at, true)}</p>
   244	                <p><strong>수정일:</strong> ${formatDate(customer.updated_at, true)}</p>
   245	            </div>
   246	        </div>
   247	        
   248	        ${customer.memo ? `
   249	            <div style="margin-top: 20px;">
   250	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">비고</h3>
   251	                <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; white-space: pre-wrap;">
   252	                    ${customer.memo}
   253	                </div>
   254	            </div>
   255	        ` : ''}
   256	    `;
   257	    
   258	    Modal.open('detailModal');
   259	}
   260	
   261	// 모달 닫기
   262	function closeModal() {
   263	    Modal.close('customerModal');
   264	    currentEditId = null;
   265	}
   266	
   267	// 내보내기
   268	function exportData() {
   269	    if (allCustomers.length === 0) {
   270	        Toast.warning('내보낼 데이터가 없습니다.');
   271	        return;
   272	    }
   273	    
   274	    const exportData = allCustomers.map(c => ({
   275	        '방문일자': formatDate(c.visit_date),
   276	        '찾는물건(업종)': c.looking_for || '',
   277	        '연락처': c.contact || '',
   278	        '특이사항': c.special_notes || '',
   279	        '상태': c.status || '',
   280	        '비고': c.memo || '',
   281	        '등록일': formatDate(c.created_at, true)
   282	    }));
   283	    
   284	    downloadCSV(exportData, '손님목록');
   285	}
   286	