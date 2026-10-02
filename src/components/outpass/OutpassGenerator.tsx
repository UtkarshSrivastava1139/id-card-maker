/**
 * OutpassGenerator — V2 (Cart Model)
 *
 * Provides an e-commerce "Shopping Cart" style UX.
 * Left Panel: Fast browsing catalog (all outpasses, instantly filterable).
 * Right Panel: Print Queue (only items selected for print, with quantities).
 */

import { useState, useMemo } from 'react';
import {
  Search, Plus, Minus, Printer, Trash2, LayoutTemplate, X, Eye
} from 'lucide-react';
import { outpassRegistry } from '../../services/outpassRegistry';
import { generateOutpassPdf } from '../../services/outpassGenerator';
import { useOutpassStore, buildSelectionEntries } from '../../store/outpassStore';
import { useLayoutStore } from '../../store/layoutStore';
import './OutpassGenerator.css';

export default function OutpassGenerator() {
  const {
    selectedSchool,
    selectedVariantId,
    selectedClassName,
    searchTerm,
    quantities,
    setSchool,
    setVariant,
    setClassName,
    setSearchTerm,
    setQuantity,
    addBulkToCart,
    clearCart,
  } = useOutpassStore();

  const { templates, activeTemplateId } = useLayoutStore();
  const activeLayout = templates.find(t => t.id === activeTemplateId) || templates[0];

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // ─── Data derived from Registry ──────────────────────────────────────
  const variants = useMemo(() => outpassRegistry.getVariantsBySchool(selectedSchool), [selectedSchool]);
  
  const availableClasses = useMemo(() => 
    outpassRegistry.getAvailableClasses(selectedSchool, selectedVariantId || undefined), 
    [selectedSchool, selectedVariantId]
  );

  // ─── Browsing Catalog (Filtered Designs) ───────────────────────────
  const catalogDesigns = useMemo(() => {
    let designs = outpassRegistry.queryDesigns({
      school: selectedSchool,
      designVariantId: selectedVariantId || undefined,
      className: selectedClassName || undefined,
      searchTerm: searchTerm || undefined,
    });
    return designs;
  }, [selectedSchool, selectedVariantId, selectedClassName, searchTerm]);

  // ─── Cart (Print Queue) ────────────────────────────────────────────
  const cartEntries = useMemo(
    () => buildSelectionEntries(quantities, outpassRegistry.getAllDesigns().map(d => d.id)),
    [quantities]
  );

  const cartDesigns = useMemo(() => {
    return cartEntries
      .map(entry => ({
        design: outpassRegistry.getDesignById(entry.designId)!,
        quantity: entry.quantity
      }))
      .filter(item => item.design);
  }, [cartEntries]);

  const totalCards = useMemo(
    () => cartEntries.reduce((sum, e) => sum + e.quantity, 0),
    [cartEntries]
  );

  const cardsPerPage = activeLayout?.slots.length || 10;
  const totalPages = Math.ceil(totalCards / cardsPerPage);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!activeLayout || totalCards === 0) return;
    setIsGenerating(true);
    setProgress({ current: 0, total: totalCards });

    try {
      await generateOutpassPdf(
        cartEntries,
        activeLayout,
        (current, total) => setProgress({ current, total })
      );
    } catch (err: any) {
      alert(err.message || 'Error generating PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!activeLayout || totalCards === 0) return;
    setIsGenerating(true);
    setProgress({ current: 0, total: totalCards });

    try {
      await generateOutpassPdf(
        cartEntries,
        activeLayout,
        (current, total) => setProgress({ current, total }),
        true // preview
      );
    } catch (err: any) {
      alert(err.message || 'Error generating PDF preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAllVisible = () => {
    addBulkToCart(catalogDesigns.map(d => d.id));
  };

  // ─── Renderers ─────────────────────────────────────────────────────
  return (
    <div className="outpass-v2-container">
      {/* HEADER */}
      <header className="outpass-v2-header">
        <div className="op-school-toggle">
          <button 
            className={`op-school-btn ${selectedSchool === 'SRDIC' ? 'active' : ''}`}
            onClick={() => setSchool('SRDIC')}
          >
            SRDIC
          </button>
          <button 
            className={`op-school-btn ${selectedSchool === 'SRDCA' ? 'active' : ''}`}
            onClick={() => setSchool('SRDCA')}
          >
            SRDCA
          </button>
        </div>

        <div className="op-search-bar">
          <Search size={16} className="op-search-icon" />
          <input
            type="text"
            placeholder="Search outpasses (e.g., 10B, Nursery, or Name)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="outpass-v2-body">
        
        {/* CATALOG PANEL (LEFT) */}
        <div className="op-catalog">
          <div className="op-catalog-toolbar">
            <div className="op-filters">
              <select 
                className="op-select"
                value={selectedVariantId || ''}
                onChange={e => setVariant(e.target.value || null)}
              >
                <option value="">All Variants</option>
                {variants.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>

              <select 
                className="op-select"
                value={selectedClassName || ''}
                onChange={e => setClassName(e.target.value || null)}
              >
                <option value="">All Classes</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'SUPP' ? 'Supplementary' : `Class ${cls}`}
                  </option>
                ))}
              </select>
            </div>

            {catalogDesigns.length > 0 && (
              <button className="op-bulk-btn" onClick={handleAddAllVisible}>
                <Plus size={14} /> Add all visible ({catalogDesigns.length})
              </button>
            )}
          </div>

          <div className="op-grid-container">
            {catalogDesigns.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No designs found for the current filters.
              </div>
            ) : (
              <div className="op-grid">
                {catalogDesigns.map(design => {
                  const qty = quantities[design.id] || 0;
                  const inCart = qty > 0;
                  return (
                    <div key={design.id} className={`op-card ${inCart ? 'in-cart' : ''}`}>
                      <div className={`op-card-img-wrap ${design.orientation}`}>
                        <img src={design.assetPath} alt="Outpass" className="op-card-img" loading="lazy" />
                        {inCart && <div className="op-card-badge">{qty} in Queue</div>}
                      </div>
                      <div className="op-card-info">
                        <span className="op-card-title">
                          {design.type === 'supplementary' ? `Supplementary ${design.outpassNumber}` : `${design.className} - ${design.section} (Outpass ${design.outpassNumber})`}
                        </span>
                        <span className="op-card-meta">{outpassRegistry.getVariantById(design.designVariantId)?.name}</span>
                        
                        <div className="op-card-actions">
                          {inCart ? (
                            <div className="op-qty-control">
                              <button className="op-qty-btn" onClick={() => setQuantity(design.id, qty - 1)}>
                                <Minus size={14} />
                              </button>
                              <span className="op-qty-val">{qty}</span>
                              <button className="op-qty-btn" onClick={() => setQuantity(design.id, qty + 1)}>
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button className="op-add-btn" onClick={() => setQuantity(design.id, 1)}>
                              <Plus size={14} /> Add to Print
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PRINT QUEUE SIDEBAR (RIGHT) */}
        <aside className="op-sidebar">
          <div className="op-sidebar-header">
            <h2 className="op-sidebar-title">
              <Printer size={18} /> Print Queue
            </h2>
            {cartDesigns.length > 0 && (
              <button className="op-clear-btn" onClick={clearCart}>
                Clear All
              </button>
            )}
          </div>

          <div className="op-cart-list">
            {cartDesigns.length === 0 ? (
              <div className="op-cart-empty">
                <LayoutTemplate size={48} />
                <p>Your queue is empty.<br/>Add outpasses from the catalog to start printing.</p>
              </div>
            ) : (
              cartDesigns.map(({ design, quantity }) => (
                <div key={design.id} className="op-cart-item">
                  <img src={design.assetPath} className={`op-cart-thumb ${design.orientation}`} alt="" />
                  <div className="op-cart-item-info">
                    <span className="op-cart-item-title">
                      {design.type === 'supplementary' ? `Supp. ${design.outpassNumber}` : `${design.className} - ${design.section} (#${design.outpassNumber})`}
                    </span>
                    <span className="op-cart-item-meta">{design.school} • {design.orientation}</span>
                  </div>
                  <div className="op-cart-item-actions">
                    <div className="op-mini-qty">
                      <button className="op-mini-btn" onClick={() => setQuantity(design.id, quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span className="op-mini-val">{quantity}</span>
                      <button className="op-mini-btn" onClick={() => setQuantity(design.id, quantity + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button 
                      className="op-mini-btn" 
                      style={{ color: 'var(--danger)', marginLeft: '4px' }}
                      onClick={() => setQuantity(design.id, 0)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="op-sidebar-footer">
            <div className="op-summary-row">
              <span className="op-summary-label">Layout Mode</span>
              <span className="op-summary-val" style={{ fontSize: '13px', fontWeight: 500 }}>
                {activeLayout?.name || 'Default 2x5'}
              </span>
            </div>
            <div className="op-summary-row">
              <span className="op-summary-label">Total Outpasses</span>
              <span className="op-summary-val">{totalCards}</span>
            </div>
            <div className="op-summary-row" style={{ marginBottom: '24px' }}>
              <span className="op-summary-label">Estimated Pages</span>
              <span className="op-summary-val">{totalPages}</span>
            </div>

            <div className="op-actions-row">
              <button 
                className="op-preview-btn" 
                disabled={totalCards === 0 || isGenerating}
                onClick={handlePreview}
                title="Preview PDF layout in new tab"
              >
                <Eye size={18} />
                Preview
              </button>
              
              <button 
                className="op-generate-btn" 
                style={{ flex: 1.5 }}
                disabled={totalCards === 0 || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  `Generating ${progress.current} / ${progress.total}...`
                ) : (
                  <>
                    <Printer size={18} />
                    Print {totalCards} {totalCards === 1 ? 'Outpass' : 'Outpasses'}
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
