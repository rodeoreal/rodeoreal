 1	// 매매 물건 관리 JavaScript
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
    19	let allProperties = [];
    20	let currentEditId = null;
    21	let uploadedPhotos = [];
    22	let uploadedFiles = [];
    23	
    24	// 페이지 로드 시 데이터 불러오기
    25	document.addEventListener('DOMContentLoaded', () => {
    26	    loadProperties();
    27	    setupEventListeners();
    28	    setupFileUploads();
    29	    
    30	    // 오늘 날짜를 기본값으로 설정
    31	    document.getElementById('receivedDate').valueAsDate = new Date();
    32	});
    33	
    34	// 이벤트 리스너 설정
    35	function setupEventListeners() {
    36	    const searchInput = document.getElementById('searchInput');
    37	    const statusFilter = document.getElementById('statusFilter');
    38	    const yieldFilter = document.getElementById('yieldFilter');
    39	    
    40	    searchInput.addEventListener('input', filterProperties);
    41	    statusFilter.addEventListener('change', filterProperties);
    42	    yieldFilter.addEventListener('change', filterProperties);
    43	}
    44	
    45	// 파일 업로드 설정
    46	function setupFileUploads() {
    47	    const photoUpload = document.getElementById('photoUpload');
    48	    const fileUpload = document.getElementById('fileUpload');
    49	    
    50	    photoUpload.addEventListener('change', async (e) => {
    51	        const files = Array.from(e.target.files);
    52	        for (const file of files) {
    53	            if (file.type.startsWith('image/')) {
    54	                const data = await handleFileUpload(file);
    55	                uploadedPhotos.push(data.data);
    56	                
    57	                const preview = createImagePreview(data.data, () => {
    58	                    uploadedPhotos = uploadedPhotos.filter(p => p !== data.data);
    59	                });
    60	                document.getElementById('photoPreview').appendChild(preview);
    61	            }
    62	        }
    63	        photoUpload.value = '';
    64	    });
    65	    
    66	    fileUpload.addEventListener('change', async (e) => {
    67	        const files = Array.from(e.target.files);
    68	        const fileList = document.getElementById('fileList');
    69	        
    70	        for (const file of files) {
    71	            const data = await handleFileUpload(file);
    72	            uploadedFiles.push(data);
    73	            
    74	            const fileItem = document.createElement('div');
    75	            fileItem.style.cssText = 'padding:8px;background:#F8F9FA;border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;';
    76	            fileItem.innerHTML = `
    77	                <span><i class="fas fa-file"></i> ${file.name}</span>
    78	                <button type="button" class="btn btn-sm" style="padding:4px 8px;" onclick="this.parentElement.remove()">
    79	                    <i class="fas fa-times"></i>
    80	                </button>
    81	            `;
    82	            fileList.appendChild(fileItem);
    83	        }
    84	        fileUpload.value = '';
    85	    });
    86	}
    87	
    88	// 수익률 계산 (상단 계산기)
    89	function calculateYield() {
    90	    const salePrice = parseFloat(document.getElementById('calcSalePrice').value) || 0;
    91	    const deposit = parseFloat(document.getElementById('calcDeposit').value) || 0;
    92	    const monthlyRent = parseFloat(document.getElementById('calcMonthlyRent').value) || 0;
    93	    
    94	    if (salePrice > 0) {
    95	        const annualIncome = monthlyRent * 12;
    96	        const yieldRate = (annualIncome / salePrice) * 100;
    97	        
    98	        document.getElementById('calcAnnualIncome').textContent = formatCurrency(annualIncome);
    99	        document.getElementById('calcYieldRate').textContent = yieldRate.toFixed(2) + '%';
   100	    } else {
   101	        document.getElementById('calcAnnualIncome').textContent = '0원';
   102	        document.getElementById('calcYieldRate').textContent = '0%';
   103	    }
   104	}
   105	
   106	// 폼 내 자동 수익률 계산
   107	function autoCalculateYield() {
   108	    const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
   109	    const deposit = parseFloat(document.getElementById('deposit').value) || 0;
   110	    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
   111	    
   112	    if (salePrice > 0) {
   113	        const annualIncome = monthlyRent * 12;
   114	        const yieldRate = (annualIncome / salePrice) * 100;
   115	        document.getElementById('yieldRate').value = yieldRate.toFixed(2);
   116	    } else {
   117	        document.getElementById('yieldRate').value = '';
   118	    }
   119	}
   120	
   121	// 물건 목록 불러오기
   122	async function loadProperties() {
   123	    try {
   124	        const response = await API.get('sale_properties', { limit: 1000, sort: '-created_at' });
   125	        allProperties = response.data || [];
   126	        renderProperties(allProperties);
   127	    } catch (error) {
   128	        console.error('Load properties error:', error);
   129	        Toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
   130	        document.getElementById('saleTableBody').innerHTML = `
   131	            <tr>
   132	                <td colspan="13" style="text-align: center; padding: 40px; color: var(--error-color);">
   133	                    데이터를 불러올 수 없습니다.
   134	                </td>
   135	            </tr>
   136	        `;
   137	    }
   138	}
   139	
   140	// 물건 목록 렌더링
   141	function renderProperties(properties) {
   142	    const tbody = document.getElementById('saleTableBody');
   143	    
   144	    if (!properties || properties.length === 0) {
   145	        tbody.innerHTML = `
   146	            <tr>
   147	                <td colspan="13" style="text-align: center; padding: 40px;">
   148	                    <div class="empty-state">
   149	                        <div class="empty-state-icon">🏪</div>
   150	                        <div class="empty-state-text">등록된 매매 물건이 없습니다</div>
   151	                        <button class="btn btn-primary" onclick="openAddModal()" style="margin-top: 16px;">
   152	                            물건 등록하기
   153	                        </button>
   154	                    </div>
   155	                </td>
   156	            </tr>
   157	        `;
   158	        return;
   159	    }
   160	    
   161	    tbody.innerHTML = properties.map(property => {
   162	        const yieldRate = property.yield_rate || 0;
   163	        const yieldColor = yieldRate >= 10 ? 'var(--success-color)' : 
   164	                          yieldRate >= 7 ? 'var(--warning-color)' : 
   165	                          'var(--text-primary)';
   166	        
   167	        return `
   168	            <tr>
   169	                <td>${property.address || '-'}</td>
   170	                <td>${property.building_name || '-'}</td>
   171	                <td>${property.current_store || '-'}</td>
   172	                <td>${property.floor || '-'}</td>
   173	                <td>${property.contract_area || 0}평</td>
   174	                <td>${property.actual_area || 0}평</td>
   175	                <td>${formatCurrency(property.sale_price || 0)}</td>
   176	                <td>${formatCurrency(property.deposit || 0)}</td>
   177	                <td>${formatCurrency(property.monthly_rent || 0)}</td>
   178	                <td style="color: ${yieldColor}; font-weight: 600;">${yieldRate.toFixed(2)}%</td>
   179	                <td>${formatDate(property.received_date)}</td>
   180	                <td>${getStatusBadge(property.status || '접수')}</td>
   181	                <td>
   182	                    <button class="btn btn-sm" onclick="viewDetail('${property.id}')" style="margin-right: 4px;">
   183	                        <i class="fas fa-eye"></i>
   184	                    </button>
   185	                    <button class="btn btn-sm" onclick="editProperty('${property.id}')" style="margin-right: 4px;">
   186	                        <i class="fas fa-edit"></i>
   187	                    </button>
   188	                    <button class="btn btn-sm" onclick="deleteProperty('${property.id}')" style="background: var(--error-color); color: white;">
   189	                        <i class="fas fa-trash"></i>
   190	                    </button>
   191	                </td>
   192	            </tr>
   193	        `;
   194	    }).join('');
   195	}
   196	
   197	// 필터링
   198	function filterProperties() {
   199	    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
   200	    const statusFilter = document.getElementById('statusFilter').value;
   201	    const yieldFilter = document.getElementById('yieldFilter').value;
   202	    
   203	    let filtered = allProperties;
   204	    
   205	    // 검색어 필터
   206	    if (searchTerm) {
   207	        filtered = filtered.filter(p => 
   208	            (p.address || '').toLowerCase().includes(searchTerm) ||
   209	            (p.building_name || '').toLowerCase().includes(searchTerm) ||
   210	            (p.current_store || '').toLowerCase().includes(searchTerm)
   211	        );
   212	    }
   213	    
   214	    // 상태 필터
   215	    if (statusFilter) {
   216	        filtered = filtered.filter(p => p.status === statusFilter);
   217	    }
   218	    
   219	    // 수익률 필터
   220	    if (yieldFilter) {
   221	        const minYield = parseFloat(yieldFilter);
   222	        filtered = filtered.filter(p => (p.yield_rate || 0) >= minYield);
   223	    }
   224	    
   225	    renderProperties(filtered);
   226	}
   227	
   228	// 등록 모달 열기
   229	function openAddModal() {
   230	    currentEditId = null;
   231	    uploadedPhotos = [];
   232	    uploadedFiles = [];
   233	    
   234	    document.getElementById('modalTitle').textContent = '매매 물건 등록';
   235	    document.getElementById('saleForm').reset();
   236	    document.getElementById('propertyId').value = '';
   237	    document.getElementById('photoPreview').innerHTML = '';
   238	    document.getElementById('fileList').innerHTML = '';
   239	    document.getElementById('receivedDate').valueAsDate = new Date();
   240	    
   241	    Modal.open('saleModal');
   242	}
   243	
   244	// 수정 모달 열기
   245	async function editProperty(id) {
   246	    try {
   247	        const property = allProperties.find(p => p.id === id);
   248	        if (!property) throw new Error('Property not found');
   249	        
   250	        currentEditId = id;
   251	        uploadedPhotos = property.photos || [];
   252	        uploadedFiles = property.files || [];
   253	        
   254	        document.getElementById('modalTitle').textContent = '매매 물건 수정';
   255	        document.getElementById('propertyId').value = id;
   256	        document.getElementById('address').value = property.address || '';
   257	        document.getElementById('buildingName').value = property.building_name || '';
   258	        document.getElementById('currentStore').value = property.current_store || '';
   259	        document.getElementById('receivedDate').value = property.received_date ? property.received_date.split('T')[0] : '';
   260	        document.getElementById('floor').value = property.floor || '';
   261	        document.getElementById('contractArea').value = property.contract_area || '';
   262	        document.getElementById('actualArea').value = property.actual_area || '';
   263	        document.getElementById('contact').value = property.contact || '';
   264	        document.getElementById('salePrice').value = property.sale_price || '';
   265	        document.getElementById('deposit').value = property.deposit || '';
   266	        document.getElementById('monthlyRent').value = property.monthly_rent || '';
   267	        document.getElementById('yieldRate').value = property.yield_rate || '';
   268	        document.getElementById('status').value = property.status || '접수';
   269	        document.getElementById('notes').value = property.notes || '';
   270	        
   271	        // 사진 미리보기
   272	        const photoPreview = document.getElementById('photoPreview');
   273	        photoPreview.innerHTML = '';
   274	        if (property.photos && property.photos.length > 0) {
   275	            property.photos.forEach(photo => {
   276	                const preview = createImagePreview(photo, () => {
   277	                    uploadedPhotos = uploadedPhotos.filter(p => p !== photo);
   278	                });
   279	                photoPreview.appendChild(preview);
   280	            });
   281	        }
   282	        
   283	        // 파일 목록
   284	        const fileList = document.getElementById('fileList');
   285	        fileList.innerHTML = '';
   286	        if (property.files && property.files.length > 0) {
   287	            property.files.forEach(file => {
   288	                const fileItem = document.createElement('div');
   289	                fileItem.style.cssText = 'padding:8px;background:#F8F9FA;border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;';
   290	                fileItem.innerHTML = `
   291	                    <span><i class="fas fa-file"></i> ${file.name || '파일'}</span>
   292	                    <button type="button" class="btn btn-sm" style="padding:4px 8px;" onclick="this.parentElement.remove()">
   293	                        <i class="fas fa-times"></i>
   294	                    </button>
   295	                `;
   296	                fileList.appendChild(fileItem);
   297	            });
   298	        }
   299	        
   300	        Modal.open('saleModal');
   301	    } catch (error) {
   302	        console.error('Edit property error:', error);
   303	        Toast.error('물건 정보를 불러오는 중 오류가 발생했습니다.');
   304	    }
   305	}
   306	
   307	// 저장
   308	async function saveProperty() {
   309	    const form = document.getElementById('saleForm');
   310	    if (!form.checkValidity()) {
   311	        form.reportValidity();
   312	        return;
   313	    }
   314	    
   315	    const propertyData = {
   316	        address: document.getElementById('address').value,
   317	        building_name: document.getElementById('buildingName').value,
   318	        current_store: document.getElementById('currentStore').value,
   319	        received_date: new Date(document.getElementById('receivedDate').value).toISOString(),
   320	        floor: document.getElementById('floor').value,
   321	        contract_area: parseFloat(document.getElementById('contractArea').value) || 0,
   322	        actual_area: parseFloat(document.getElementById('actualArea').value) || 0,
   323	        contact: document.getElementById('contact').value,
   324	        sale_price: parseFloat(document.getElementById('salePrice').value) || 0,
   325	        deposit: parseFloat(document.getElementById('deposit').value) || 0,
   326	        monthly_rent: parseFloat(document.getElementById('monthlyRent').value) || 0,
   327	        yield_rate: parseFloat(document.getElementById('yieldRate').value) || 0,
   328	        status: document.getElementById('status').value,
   329	        notes: document.getElementById('notes').value,
   330	        photos: uploadedPhotos,
   331	        files: uploadedFiles,
   332	        created_by: user.id
   333	    };
   334	    
   335	    try {
   336	        if (currentEditId) {
   337	            // 수정
   338	            await API.put(`sale_properties/${currentEditId}`, propertyData);
   339	            Toast.success('물건 정보가 수정되었습니다.');
   340	        } else {
   341	            // 등록
   342	            await API.post('sale_properties', propertyData);
   343	            Toast.success('새 물건이 등록되었습니다.');
   344	        }
   345	        
   346	        closeModal();
   347	        loadProperties();
   348	    } catch (error) {
   349	        console.error('Save property error:', error);
   350	        Toast.error('저장 중 오류가 발생했습니다.');
   351	    }
   352	}
   353	
   354	// 삭제
   355	async function deleteProperty(id) {
   356	    if (!confirm('정말 삭제하시겠습니까?')) return;
   357	    
   358	    try {
   359	        await API.delete(`sale_properties/${id}`);
   360	        Toast.success('물건이 삭제되었습니다.');
   361	        loadProperties();
   362	    } catch (error) {
   363	        console.error('Delete property error:', error);
   364	        Toast.error('삭제 중 오류가 발생했습니다.');
   365	    }
   366	}
   367	
   368	// 상세보기
   369	function viewDetail(id) {
   370	    const property = allProperties.find(p => p.id === id);
   371	    if (!property) return;
   372	    
   373	    const annualIncome = (property.monthly_rent || 0) * 12;
   374	    
   375	    const detailContent = document.getElementById('detailContent');
   376	    detailContent.innerHTML = `
   377	        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
   378	            <div>
   379	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">기본 정보</h3>
   380	                <p><strong>물건지:</strong> ${property.address || '-'} 
   381	                    ${property.address ? `<a href="${getNaverMapLink(property.address)}" target="_blank" class="btn btn-sm" style="margin-left: 8px;"><i class="fas fa-map-marker-alt"></i> 지도</a>` : ''}
   382	                </p>
   383	                <p><strong>건물명:</strong> ${property.building_name || '-'}</p>
   384	                <p><strong>현재상호:</strong> ${property.current_store || '-'}</p>
   385	                <p><strong>층:</strong> ${property.floor || '-'}</p>
   386	                <p><strong>접수일:</strong> ${formatDate(property.received_date)}</p>
   387	                <p><strong>연락처:</strong> ${property.contact || '-'}</p>
   388	                <p><strong>상태:</strong> ${getStatusBadge(property.status || '접수')}</p>
   389	            </div>
   390	            <div>
   391	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">금액 정보</h3>
   392	                <p><strong>분양면적:</strong> ${property.contract_area || 0}평</p>
   393	                <p><strong>실면적:</strong> ${property.actual_area || 0}평</p>
   394	                <p><strong>매매가:</strong> ${formatCurrency(property.sale_price || 0)}</p>
   395	                <p><strong>보증금:</strong> ${formatCurrency(property.deposit || 0)}</p>
   396	                <p><strong>월세:</strong> ${formatCurrency(property.monthly_rent || 0)}</p>
   397	                <p><strong>연 수익:</strong> ${formatCurrency(annualIncome)}</p>
   398	                <p><strong>수익률:</strong> <span style="color: var(--naver-green); font-size: 18px; font-weight: 700;">${(property.yield_rate || 0).toFixed(2)}%</span></p>
   399	            </div>
   400	        </div>
   401	        
   402	        ${property.notes ? `
   403	            <div style="margin-top: 20px;">
   404	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">비고</h3>
   405	                <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; white-space: pre-wrap;">
   406	                    ${property.notes}
   407	                </div>
   408	            </div>
   409	        ` : ''}
   410	        
   411	        ${property.photos && property.photos.length > 0 ? `
   412	            <div style="margin-top: 20px;">
   413	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">사진</h3>
   414	                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
   415	                    ${property.photos.map(photo => `
   416	                        <img src="${photo}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open('${photo}', '_blank')">
   417	                    `).join('')}
   418	                </div>
   419	            </div>
   420	        ` : ''}
   421	        
   422	        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
   423	            <p style="font-size: 13px; color: var(--text-secondary);">등록일: ${formatDate(property.created_at, true)}</p>
   424	            <p style="font-size: 13px; color: var(--text-secondary);">수정일: ${formatDate(property.updated_at, true)}</p>
   425	        </div>
   426	    `;
   427	    
   428	    Modal.open('detailModal');
   429	}
   430	
   431	// 모달 닫기
   432	function closeModal() {
   433	    Modal.close('saleModal');
   434	    currentEditId = null;
   435	    uploadedPhotos = [];
   436	    uploadedFiles = [];
   437	}
   438	
   439	// 내보내기
   440	function exportData() {
   441	    if (allProperties.length === 0) {
   442	        Toast.warning('내보낼 데이터가 없습니다.');
   443	        return;
   444	    }
   445	    
   446	    const exportData = allProperties.map(p => ({
   447	        '물건지': p.address || '',
   448	        '건물명': p.building_name || '',
   449	        '현재상호': p.current_store || '',
   450	        '층': p.floor || '',
   451	        '분양면적(평)': p.contract_area || 0,
   452	        '실면적(평)': p.actual_area || 0,
   453	        '매매가(만원)': p.sale_price || 0,
   454	        '보증금(만원)': p.deposit || 0,
   455	        '월세(만원)': p.monthly_rent || 0,
   456	        '수익률(%)': p.yield_rate || 0,
   457	        '연락처': p.contact || '',
   458	        '접수일': formatDate(p.received_date),
   459	        '상태': p.status || '',
   460	        '비고': p.notes || ''
   461	    }));
   462	    
   463	    downloadCSV(exportData, '매매물건목록');
   464	}
   465	